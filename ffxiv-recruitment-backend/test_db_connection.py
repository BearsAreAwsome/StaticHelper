from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

try:
    client = MongoClient(os.getenv('MONGO_URI'))
    # Trigger connection
    client.server_info()
    print("✅ MongoDB connection successful!")
    
    # List databases
    print("\nAvailable databases:")
    for db_name in client.list_database_names():
        print(f"  - {db_name}")
        
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")