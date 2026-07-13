import os
import pymongo
import datetime
from dotenv import load_dotenv

load_dotenv()
uri = os.environ.get("MONGODB_URI")
client = pymongo.MongoClient(uri)
db = client["github_pr_analyzer"]
job_queue = db["Job_Queue"]

# Force upsert axios/axios job status to PENDING
res = job_queue.update_one(
    {"_id": "axios/axios"},
    {"$set": {
        "status": "PENDING",
        "repo_name": "axios/axios",
        "error": None,
        "failed_at": None,
        "created_at": datetime.datetime.now(datetime.timezone.utc)
    }},
    upsert=True
)
print(f"Matched: {res.matched_count}, Modified: {res.modified_count}, Upserted ID: {res.upserted_id}")
