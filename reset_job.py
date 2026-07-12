import os
import pymongo
from dotenv import load_dotenv

load_dotenv()
uri = os.environ.get("MONGODB_URI")
client = pymongo.MongoClient(uri)
db = client["github_pr_analyzer"]
job_queue = db["Job_Queue"]

# Reset axios/axios job status to PENDING
res = job_queue.update_one(
    {"_id": "axios/axios"},
    {"$set": {"status": "PENDING", "error": None, "failed_at": None}}
)
print(f"Matched: {res.matched_count}, Modified: {res.modified_count}")
