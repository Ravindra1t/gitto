import asyncio
import os
import sys
import json
import datetime
import platform
import traceback


from dotenv import load_dotenv
from groq import Groq
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from pymongo import MongoClient, ReturnDocument

# Load environment variables from .env file
load_dotenv()

# Verify required keys are set
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/")

if not GITHUB_TOKEN or (not GEMINI_API_KEY and not GROQ_API_KEY):
    print("\n" + "="*60)
    print("[ERROR] Missing environment variables!")
    print("Please set GITHUB_TOKEN and either GEMINI_API_KEY or GROQ_API_KEY in your .env file:")
    print(f"Path: {os.path.abspath('.env')}")
    print("="*60 + "\n")
    sys.exit(1)

# Configuration constants
PR_COUNT = 50


def map_mcp_to_llm_tool(mcp_tool):
    """Converts an MCP tool definition to an LLM-compatible tool schema."""
    parameters = dict(mcp_tool.inputSchema)
    # Remove metadata fields that might confuse the model/API schema validator
    parameters.pop("$schema", None)
    parameters.pop("additionalProperties", None)
    
    # Standardize 'number' to 'integer' for API compatibility
    if "properties" in parameters:
        for prop_name, prop_val in parameters["properties"].items():
            if isinstance(prop_val, dict) and prop_val.get("type") == "number":
                prop_val["type"] = "integer"
    
    return {
        "type": "function",
        "function": {
            "name": mcp_tool.name,
            "description": mcp_tool.description,
            "parameters": parameters
        }
    }


def compress_tool_output(name, output_text):
    """Parses tool output JSON and extracts only the essential info to drastically reduce token usage."""
    try:
        data = json.loads(output_text)
        if name == "get_pull_request_files" and isinstance(data, list):
            compressed = []
            # Keep only the first 10 files to prevent token bloat
            for f in data[:10]:
                compressed.append({
                    "filename": f.get("filename"),
                    "additions": f.get("additions"),
                    "deletions": f.get("deletions")
                })
            if len(data) > 10:
                # Add a summary node for the remaining files
                remaining_additions = sum(f.get("additions", 0) for f in data[10:])
                remaining_deletions = sum(f.get("deletions", 0) for f in data[10:])
                compressed.append({
                    "filename": f"...and {len(data) - 10} other files",
                    "additions": remaining_additions,
                    "deletions": remaining_deletions
                })
            return json.dumps(compressed, indent=2)
            
        elif name == "get_pull_request_comments" and isinstance(data, list):
            compressed = []
            bot_keywords = ["github-actions", "sonarcloud", "vercel", "netlify", "coveralls", "lgtm", "bot", "jenkins"]
            
            for c in data:
                author = c.get("user", {}).get("login", "").lower()
                body = c.get("body", "")
                
                # Filter out bots and automated noise
                if any(k in author for k in bot_keywords) or any(k in body.lower() for k in bot_keywords):
                    continue
                    
                # Skip trivial comments under 10 characters (e.g. "done", "thanks", "lgtm")
                clean_body = body.strip()
                if len(clean_body) < 10:
                    continue
                
                compressed.append({
                    "user": c.get("user", {}).get("login"),
                    "body": clean_body[:150] + "..." if len(clean_body) > 150 else clean_body
                })
                
                # Limit to top 15 comments per PR to prevent context blowup
                if len(compressed) >= 15:
                    break
                    
            return json.dumps(compressed, indent=2)
    except Exception:
        pass
    return output_text[:1000] + "...\n[TRUNCATED]" if len(output_text) > 1000 else output_text


async def fetch_merged_prs(session, owner, repo, count):
    """Fetches the last N merged PRs from the target repository using the search_issues MCP tool."""
    print(f" -> Fetching merged pull requests for {owner}/{repo} using search_issues...")
    
    query = f"repo:{owner}/{repo} is:pr is:merged"
    prs_result = await session.call_tool("search_issues", {
        "q": query,
        "per_page": count
    })
    
    prs_text = prs_result.content[0].text
    prs_data = json.loads(prs_text)
    
    items = prs_data.get("items", [])
    print(f" -> Found {len(items)} merged pull requests.")
    return items

async def execute_single_tool(session, tool_call, owner, repo):
    name = tool_call.function.name
    try:
        args = json.loads(tool_call.function.arguments)
    except Exception as parse_err:
        return {
            "role": "tool",
            "tool_call_id": tool_call.id,
            "name": name,
            "content": f"Error parsing arguments: {str(parse_err)}"
        }

    # Inject owner/repo into args if omitted by the model
    if "owner" not in args:
        args["owner"] = owner
    if "repo" not in args:
        args["repo"] = repo
        
    try:
        # Execute the tool via MCP Session
        tool_result = await session.call_tool(name, args)
        text_blocks = []
        for content_block in tool_result.content:
            if hasattr(content_block, "text"):
                text_blocks.append(content_block.text)
            elif isinstance(content_block, dict) and "text" in content_block:
                text_blocks.append(content_block["text"])
            else:
                text_blocks.append(str(content_block))
        tool_output = "\n".join(text_blocks)
    except Exception as e:
        tool_output = f"Error executing tool: {type(e).__name__}: {str(e)}"
    
    compressed_output = compress_tool_output(name, tool_output)
    return {
        "role": "tool",
        "tool_call_id": tool_call.id,
        "name": name,
        "content": compressed_output
    }

async def call_llm_with_retry(llm_client, model_name, messages, tools, tool_choice="auto", max_retries=3, base_delay=15):
    """Executes a chat completion call with automatic exponential backoff for rate limit (429) errors."""
    for attempt in range(max_retries):
        try:
            # Run the synchronous API call in a thread pool to avoid blocking the event loop
            response = await asyncio.to_thread(
                llm_client.chat.completions.create,
                model=model_name,
                messages=messages,
                tools=tools,
                tool_choice=tool_choice
            )
            return response
        except Exception as e:
            err_msg = str(e).lower()
            is_rate_limit = "rate limit" in err_msg or "429" in err_msg or "resource_exhausted" in err_msg or "quota" in err_msg
            
            if is_rate_limit and attempt < max_retries - 1:
                print(f" -> [RATE LIMIT WARNING] 429 Rate Limit/Resource Exhausted hit. Sleeping for {base_delay} seconds before retry (attempt {attempt + 1}/{max_retries})...")
                await asyncio.sleep(base_delay)
            else:
                raise e

async def analyze_repo(owner, repo, llm_client, model_name, db):


    """Runs the full MCP + LLM analysis for a specific repository and returns the parsed JSON result."""
    print(f" -> Launching GitHub MCP server subprocess for {owner}/{repo}...")
    
    # Prepare subprocess environment
    env = {**os.environ, "GITHUB_TOKEN": GITHUB_TOKEN}

    if platform.system() == "Windows":
        npx_path = r"C:\Program Files\nodejs\npx.cmd"
        node_dir = r"C:\Program Files\nodejs"
        env["PATH"] = node_dir + os.pathsep + env.get("PATH", "")
        server_params = StdioServerParameters(
            command="cmd.exe",
            args=["/c", npx_path, "-y", "@modelcontextprotocol/server-github"],
            env=env
        )
    else:
        # Linux/macOS/Docker - npx and node are assumed to be in system PATH
        server_params = StdioServerParameters(
            command="npx",
            args=["-y", "@modelcontextprotocol/server-github"],
            env=env
        )


    async with stdio_client(server_params) as (read_stream, write_stream):
        print(" -> Connected. Initializing Model Context Protocol session...")
        async with ClientSession(read_stream, write_stream) as session:
            await session.initialize()
            
            # Retrieve list of available tools
            tools_response = await session.list_tools()
            mcp_tools = tools_response.tools
            
            # Fetch the last 50 merged PRs
            merged_prs = await fetch_merged_prs(session, owner, repo, PR_COUNT)
            
            if not merged_prs:
                raise Exception(f"No merged PRs found for {owner}/{repo}")

            # Format the PRs list for the LLM context
            prs_list_for_llm = []
            for pr in merged_prs:
                prs_list_for_llm.append({
                    "number": pr.get("number"),
                    "title": pr.get("title"),
                    "author": pr.get("user", {}).get("login"),
                    "created_at": pr.get("created_at"),
                    "closed_at": pr.get("closed_at"),
                    "comments_count": pr.get("comments", 0)
                })


            # Filter tools to only expose relevant ones to the LLM
            target_tools = {"get_pull_request_files", "get_pull_request_comments"}
            filtered_llm_tools = [
                map_mcp_to_llm_tool(t) for t in mcp_tools if t.name in target_tools
            ]

            # Construct messages
            system_prompt = f"""You are an expert GitHub Pull Request Analyzer. Your goal is to analyze the last 50 merged pull requests of a repository and provide structured metrics and a highly detailed, professional qualitative evaluation.

You have access to the following tools to fetch details of the PRs:
1. `get_pull_request_files`: Get the files changed in a PR. Use this to determine the files changed, addition/deletion lines (size), and file paths (domain: frontend/backend/devops).
2. `get_pull_request_comments`: Get review comments on a PR. Use this to analyze feedback from reviewers, reasons for revisions, and what was discussed before merging.

Please perform the following analysis for the 50 PRs provided:
1. Classify each PR's size into a tier: Small (<100 lines changed), Medium (100-500 lines changed), or Large (>500 lines changed).
2. Classify each PR's domain: Frontend (UI, React components, CSS, JS/TS source files), Backend (Server logic, APIs, Node scripts, renderer code, database configs), or DevOps (GitHub Actions, workflows, CI/CD configs, building scripts, package releases).
3. Calculate Merge Velocity metrics comparing `created_at` and `closed_at` timestamps:
   - Fast: Merged in less than 24 hours.
   - Medium: Merged in 1 to 5 days.
   - Slow: Merged in over 5 days.
4. Calculate Discussion Density metrics based on `comments_count`:
   - None: 0 comments.
   - Low: 1 to 5 comments.
   - High: More than 5 comments.
5. Provide a long, detailed, and highly specific markdown summary (at least 3-4 paragraphs, 300-500 words) using clean markdown styling (headers, bold text, bullet points).

To make an accurate assessment:
- You MUST call `get_pull_request_files` and `get_pull_request_comments` on a sample of at least 5 to 10 PRs to understand the code composition and reviewer dynamics.
- Focus on PRs that seem representative, complex, or have interesting comments/titles.
- Do not make more than 15 tool calls in total to avoid rate limits.

Your final response must be a single JSON object with the following keys:
- 'size_tiers': A dictionary containing percentages of 'small', 'medium', and 'large' PRs (summing to 100.0).
- 'domains': A dictionary containing percentages of 'frontend', 'backend', and 'devops' PRs (summing to 100.0).
- 'merge_velocity': A dictionary containing percentages of 'fast', 'medium', and 'slow' PRs (summing to 100.0).
- 'discussion_density': A dictionary containing percentages of 'none', 'low', and 'high' PRs (summing to 100.0).
- 'llm_summaries': A highly structured markdown text containing a detailed analysis of code patterns, reviewer feedback, common revision requests, and acceptability standards.

Example output format:
{{
  "size_tiers": {{
    "small": 45.0,
    "medium": 40.0,
    "large": 15.0
  }},
  "domains": {{
    "frontend": 80.0,
    "backend": 10.0,
    "devops": 10.0
  }},
  "merge_velocity": {{
    "fast": 60.0,
    "medium": 30.0,
    "slow": 10.0
  }},
  "discussion_density": {{
    "none": 50.0,
    "low": 40.0,
    "high": 10.0
  }},
  "llm_summaries": "### 1. Code Review Dynamics & Common Triggers\\nReviewers in this repository heavily emphasize clean architecture, strict linting, and proper testing coverage. Common revision triggers include:\\n- **Performance Overhead**: Concerns regarding inefficient renders or network requests.\\n- **Formatting and Styles**: Missing typings or style rule violations.\\n\\n### 2. Standards for Acceptability\\nPRs are generally accepted and merged once all automated checks pass and at least one core reviewer gives a detailed sign-off. Code changes in this repository are highly frontend-centric, focusing on React components and state management.\\n\\n### 3. Recommended Workflow\\nFor new contributors, we recommend:\\n1. Running local tests before push.\\n2. Breaking down code refactors into smaller, single-file pull requests to speed up the review cycle."
}}
"""


            user_content = f"Here are the last {len(prs_list_for_llm)} merged pull requests for the repository {owner}/{repo}:\n\n"
            user_content += json.dumps(prs_list_for_llm, indent=2)
            user_content += "\n\nPlease analyze them using the tools and return the structured JSON output."

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ]


            print(f" -> Starting analysis with {model_name}...")
            
            # Tool-calling loop
            max_turns = 15
            for turn in range(max_turns):
                # Check if this job has been cancelled in the database
                repo_id = f"{owner}/{repo}".lower()
                job_doc = await asyncio.to_thread(db["Job_Queue"].find_one, {"_id": repo_id})
                if job_doc and job_doc.get("status") == "CANCELLED":
                    print(f" -> [CANCELLED] Analysis for {repo_id} was cancelled by user. Terminating loop immediately.")
                    await asyncio.to_thread(db["Job_Queue"].delete_one, {"_id": repo_id})
                    raise Exception("Analysis cancelled by user")

                response = await call_llm_with_retry(
                    llm_client,
                    model_name=model_name,
                    messages=messages,
                    tools=filtered_llm_tools,
                    tool_choice="auto"
                )
                
                message = response.choices[0].message
                
                messages.append(message)
                
                if message.tool_calls:
                    total_calls = len(message.tool_calls)
                    print(f" -> [Turn {turn + 1}] Model requested {total_calls} tool call(s). Processing sequentially...")
                    
                    tool_messages = []
                    for idx, tc in enumerate(message.tool_calls):
                        print(f" -> Processing PR tool call {idx + 1} of {total_calls}...")
                        res = await execute_single_tool(session, tc, owner, repo)
                        tool_messages.append(res)
                        
                        print(" -> Sleeping for 4.5s to respect rate limits...")
                        await asyncio.sleep(4.5)
                        
                    messages.extend(tool_messages)

                else:
                    print(" -> Model analysis loop completed. Parsing final JSON response...")
                    # Parse the final output as JSON
                    try:
                        return json.loads(message.content)
                    except Exception as json_err:
                        # Sometimes models include markdown code blocks around JSON
                        clean_content = message.content.strip()
                        if clean_content.startswith("```json"):
                            clean_content = clean_content[7:]
                        if clean_content.endswith("```"):
                            clean_content = clean_content[:-3]
                        clean_content = clean_content.strip()
                        return json.loads(clean_content)
                        
            raise Exception("Model reached maximum turn limit without generating final response.")

async def start_worker():
    """Continuously polls the MongoDB Job_Queue and processes pending PR analysis tasks."""
    print("\n" + "="*70)
    print("      GitHub PR Analyzer Worker Loop is starting...      ")
    print(f"      Polling MongoDB at: {MONGODB_URI} every 10s       ")
    print("="*70 + "\n")
    
    # Setup database connections
    client = MongoClient(MONGODB_URI)
    db = client["github_pr_analyzer"]
    job_queue = db["Job_Queue"]
    pr_reports = db["PR_Reports"]
    
    # Recover any crashed/stuck processing jobs back to PENDING on startup
    recovered = job_queue.update_many(
        {"status": "PROCESSING"},
        {"$set": {"status": "PENDING", "started_at": None}}
    )
    if recovered.modified_count > 0:
        print(f" -> [RECOVERY] Reset {recovered.modified_count} stuck 'PROCESSING' jobs back to 'PENDING'.")

    
    # Initialize LLM client (Default to Gemini if API key is set, fallback to Groq)
    if GEMINI_API_KEY:
        from openai import OpenAI
        llm_client = OpenAI(
            api_key=GEMINI_API_KEY,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )
        model_name = os.environ.get("GEMINI_MODEL", "gemini-flash-latest")
        print(f" -> [LLM INIT] Configured Gemini client using model '{model_name}'")
    else:
        llm_client = Groq(api_key=GROQ_API_KEY)
        model_name = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
        print(f" -> [LLM INIT] Configured Groq client using model '{model_name}'")
    
    # Simple heartbeat tracking
    last_heartbeat = datetime.datetime.now()
    
    try:
        while True:
            # Poll for PENDING job and transition it atomically to PROCESSING
            job = await asyncio.to_thread(
                job_queue.find_one_and_update,
                {"status": "PENDING"},
                {"$set": {
                    "status": "PROCESSING",
                    "started_at": datetime.datetime.now(datetime.timezone.utc)
                }},
                return_document=ReturnDocument.AFTER
            )
            
            if job:
                repo_name = job.get("repo_name")
                print(f"\n[{datetime.datetime.now().strftime('%H:%M:%S')}] [JOB ACQUIRED] '{repo_name}'")
                
                # Check valid format
                if "/" not in repo_name:
                    print(f" -> [ERROR] Invalid repo_name format: '{repo_name}'. Expected 'owner/repo'. Deleting job.")
                    await asyncio.to_thread(job_queue.delete_one, {"_id": job["_id"]})
                    continue
                
                owner, repo = repo_name.split("/", 1)
                
                try:
                    # Run the actual PR analysis
                    analysis_result = await analyze_repo(owner, repo, llm_client, model_name, db)
                    
                    # Construct report document
                    report_document = {
                        "_id": repo_name,
                        "repo_name": repo_name,
                        "size_tiers": analysis_result.get("size_tiers"),
                        "domains": analysis_result.get("domains"),
                        "merge_velocity": analysis_result.get("merge_velocity"),
                        "discussion_density": analysis_result.get("discussion_density"),
                        "llm_summaries": analysis_result.get("llm_summaries"),
                        "analyzed_at": datetime.datetime.now(datetime.timezone.utc)
                    }

                    
                    # Save report to PR_Reports collection (upsert)
                    await asyncio.to_thread(
                        pr_reports.update_one,
                        {"_id": repo_name},
                        {"$set": report_document},
                        upsert=True
                    )
                    print(f" -> [SUCCESS] Report written to 'PR_Reports' collection.")
                    
                    # Delete the job from the queue
                    await asyncio.to_thread(job_queue.delete_one, {"_id": job["_id"]})
                    print(f" -> [COMPLETED] Job for '{repo_name}' successfully removed from 'Job_Queue'.")
                    
                except Exception as ex:
                    print(f" -> [FAILED] Error processing '{repo_name}': {ex}")
                    traceback.print_exc()

                    # Format a clean, user-friendly error message
                    error_message = str(ex)
                    
                    # Resolve underlying cause if wrapped in an ExceptionGroup (common in AnyIO task groups)
                    try:
                        if hasattr(ex, "exceptions") and ex.exceptions:
                            underlying_err = ex.exceptions[0]
                            error_message = str(underlying_err)
                    except Exception:
                        pass
                    
                    # Clean up common API errors
                    error_message_lower = error_message.lower()
                    if "rate limit" in error_message_lower or "429" in error_message_lower:
                        if "tpd" in error_message_lower or "quota" in error_message_lower:
                            error_message = "LLM Daily Rate Limit reached. Please wait for the daily quota to reset."
                        else:
                            error_message = "LLM API rate limit reached. Please try again in a few seconds."
                    elif "analysis cancelled" in error_message_lower:
                        error_message = "Analysis cancelled by user."

                    # Update status to FAILED with error message
                    await asyncio.to_thread(
                        job_queue.update_one,
                        {"_id": job["_id"]},
                        {"$set": {
                            "status": "FAILED",
                            "error": error_message,
                            "failed_at": datetime.datetime.now(datetime.timezone.utc)
                        }}
                    )
            else:
                # Log a minor heartbeat indicator every 30 seconds to show worker is active
                now = datetime.datetime.now()
                if (now - last_heartbeat).seconds >= 30:
                    print(f"[{now.strftime('%H:%M:%S')}] Polling... [No pending jobs in queue]")
                    last_heartbeat = now
                
            # Wait 10 seconds before the next check
            await asyncio.sleep(10)
            
    except KeyboardInterrupt:
        print("\nWorker loop terminated by user.")
    except Exception as e:
        print(f"\n[FATAL] Worker loop crashed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    try:
        asyncio.run(start_worker())
    except KeyboardInterrupt:
        print("\nWorker loop stopped.")
