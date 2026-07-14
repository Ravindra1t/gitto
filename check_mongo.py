import pymongo

client = pymongo.MongoClient('mongodb+srv://rravindranath549_db_user:iEKK0RUAYqAemPK3@cluster0.uepnz1r.mongodb.net/?appName=Cluster0')
db = client['github_pr_analyzer']

print("Checking Job_Queue:")
for job in db['Job_Queue'].find():
    print(job)

print("\nChecking Reports:")
for report in db['Reports'].find({}, {'llm_summaries': 0}):
    print(report)
