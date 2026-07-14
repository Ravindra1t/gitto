import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
key = os.environ.get("GEMINI_API_KEY")
print("Testing simple completion. Key starting with:", key[:10] if key else "None")

try:
    client = OpenAI(
        api_key=key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )
    
    response = client.chat.completions.create(
        model="gemini-2.0-flash",
        messages=[{"role": "user", "content": "hi"}]
    )
    print("SUCCESS! Response:", response.choices[0].message.content)
except Exception as e:
    print("ERROR:", e)
