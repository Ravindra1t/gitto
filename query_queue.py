import os
import pymongo
from dotenv import load_dotenv

load_dotenv()
uri = os.environ.get("MONGODB_URI")
client = pymongo.MongoClient(uri)
db = client["github_pr_analyzer"]

print("=== Job Queue documents ===")
for doc in db["Job_Queue"].find():
    print(doc)

print("\n=== PR Reports cached ===")
for doc in db["PR_Reports"].find({}, {"_id": 1, "analyzed_at": 1}):
    print(doc)
