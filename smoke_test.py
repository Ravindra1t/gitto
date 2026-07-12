import asyncio
import os
import platform

from dotenv import load_dotenv
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# Load environment variables from .env file
load_dotenv()

async def run_smoke_test():
    print("--- Starting GitHub MCP Smoke Test ---")
    
    # Get GITHUB_TOKEN from env or use a dummy token to test connection
    github_token = os.environ.get("GITHUB_TOKEN")
    if not github_token:
        print("[WARNING] GITHUB_TOKEN is not set. Setting a dummy value to test connection.")
        github_token = "dummy_token"

    # Prepare subprocess environment
    env = {**os.environ, "GITHUB_TOKEN": github_token}

    if platform.system() == "Windows":
        npx_path = r"C:\Program Files\nodejs\npx.cmd"
        node_dir = r"C:\Program Files\nodejs"
        print(f"Server NPX Command path (Windows): {npx_path}")
        env["PATH"] = node_dir + os.pathsep + env.get("PATH", "")
        server_params = StdioServerParameters(
            command="cmd.exe",
            args=["/c", npx_path, "-y", "@modelcontextprotocol/server-github"],
            env=env
        )
    else:
        print("Server NPX Command (Linux/macOS/Docker): npx")
        server_params = StdioServerParameters(
            command="npx",
            args=["-y", "@modelcontextprotocol/server-github"],
            env=env
        )


    print("Spawning GitHub MCP server subprocess...")
    try:
        async with stdio_client(server_params) as (read_stream, write_stream):
            print("Connected to stdio transport stream. Initializing session...")
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                print("Session initialized successfully!")
                
                print("Retrieving list of tools...")
                tools_response = await session.list_tools()
                
                print(f"Successfully retrieved {len(tools_response.tools)} tools:")
                for tool in tools_response.tools:
                    print(f" - {tool.name}: {tool.description[:70]}...")
                    
    except Exception as e:
        print(f"[ERROR] Failed to run smoke test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(run_smoke_test())
