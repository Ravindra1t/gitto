import os
import pymongo
from dotenv import load_dotenv

load_dotenv()
uri = os.environ.get("MONGODB_URI")
client = pymongo.MongoClient(uri)
db = client["github_pr_analyzer"]
job_queue = db["Job_Queue"]

res = job_queue.delete_many({})
print(f"Deleted {res.deleted_count} jobs from the queue.")
