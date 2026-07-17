import asyncio
import os
import json
import platform
from dotenv import load_dotenv
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

load_dotenv()

async def inspect():
    env = {**os.environ, "GITHUB_TOKEN": os.environ.get("GITHUB_TOKEN", "dummy")}

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
        server_params = StdioServerParameters(
            command="npx",
            args=["-y", "@modelcontextprotocol/server-github"],
            env=env
        )


    async with stdio_client(server_params) as (read_stream, write_stream):
        async with ClientSession(read_stream, write_stream) as session:
            await session.initialize()
            tools_response = await session.list_tools()
            
            for t in tools_response.tools:
                print(t.name)

if __name__ == "__main__":
    asyncio.run(inspect())
