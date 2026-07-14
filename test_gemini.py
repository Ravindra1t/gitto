import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
key = os.environ.get("GEMINI_API_KEY")
print("Key found:", key[:10] if key else "None")

try:
    client = OpenAI(
        api_key=key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )
    
    models = ["gemini-2.5-pro", "gemini-2.0-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash"]
    for model_name in models:
        print(f"Testing model: {model_name}...")
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": "Reply with Pong"}]
            )
            print(f"SUCCESS with {model_name}:", response.choices[0].message.content)
            # If successful, we print a big success flag
            print(">>> FOUND WORKING MODEL:", model_name)
            break
        except Exception as e:
            print(f"FAILED with {model_name}:", str(e)[:300])
except Exception as e:
    print("Initialization error:", e)
