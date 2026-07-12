import os
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING
import datetime

# Load environment variables from .env file
load_dotenv()

# Verify MONGODB_URI is set
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/")

def initialize_database():
    print("--- Initializing MongoDB for GitHub PR Analyzer ---")
    print(f"Connecting to MongoDB at: {MONGODB_URI}")
    
    try:
        # Establish MongoDB connection
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        
        # Trigger connection check
        client.server_info()
        print("[Success] Connected to MongoDB server.")
        
        # Access the database
        db = client["github_pr_analyzer"]
        
        # 1. PR_Reports Collection
        print("\nConfiguring 'PR_Reports' collection...")
        pr_reports_col = db["PR_Reports"]
        # Create a unique index on 'repo_name' in case we don't use _id as the primary key
        # (Though we'll use 'repo_name' as '_id' for absolute primary-key semantics)
        pr_reports_col.create_index([("repo_name", ASCENDING)], unique=True)
        print(" -> Unique index on 'repo_name' verified/created.")
        
        # 2. Job_Queue Collection
        print("Configuring 'Job_Queue' collection...")
        job_queue_col = db["Job_Queue"]
        job_queue_col.create_index([("repo_name", ASCENDING)], unique=True)
        print(" -> Unique index on 'repo_name' verified/created.")
        
        # 3. Seed Job for Testing
        test_repo = "react/react"
        print(f"\nChecking/Seeding Job Queue for test repository '{test_repo}'...")
        
        # Upsert a pending job for react/react
        job_document = {
            "_id": test_repo,
            "repo_name": test_repo,
            "status": "PENDING",
            "created_at": datetime.datetime.now(datetime.timezone.utc)
        }
        
        result = job_queue_col.update_one(
            {"_id": test_repo},
            {"$setOnInsert": job_document},
            upsert=True
        )
        
        if result.matched_count > 0:
            print(f" -> Job for '{test_repo}' already exists in Job_Queue.")
        else:
            print(f" -> [Seeded] Added job for '{test_repo}' with status 'PENDING' to Job_Queue.")
            
        print("\nDatabase initialization complete! You are ready to start the Worker Loop.")
        
    except Exception as e:
        print(f"\n[ERROR] Failed to initialize database: {e}")
        print("Please verify your MongoDB service is running locally or that your MONGODB_URI is correct.")
        
if __name__ == "__main__":
    initialize_database()
