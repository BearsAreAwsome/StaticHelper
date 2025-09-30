"""
Debug script to test MongoDB connection
Run this to diagnose connection issues
"""
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

print("=" * 50)
print("MongoDB Connection Diagnostics")
print("=" * 50)

# Check if MONGO_URI is set
mongo_uri = os.getenv('MONGO_URI')
print(f"\n1. MONGO_URI found in .env: {'✅ Yes' if mongo_uri else '❌ No'}")

if mongo_uri:
    # Hide password for display
    display_uri = mongo_uri
    if '@' in mongo_uri and '://' in mongo_uri:
        protocol = mongo_uri.split('://')[0]
        rest = mongo_uri.split('://')[1]
        if '@' in rest:
            credentials = rest.split('@')[0]
            server = rest.split('@')[1]
            display_uri = f"{protocol}://***:***@{server}"
    
    print(f"   URI: {display_uri}")
else:
    print("   ❌ MONGO_URI not found in .env file!")
    print("   Please set MONGO_URI in your .env file")
    print("\n   Example for local MongoDB:")
    print("   MONGO_URI=mongodb://localhost:27017/ffxiv_recruitment")
    print("\n   Example for MongoDB Atlas:")
    print("   MONGO_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/ffxiv_recruitment?retryWrites=true&w=majority")
    exit(1)

# Test connection
print("\n2. Testing MongoDB connection...")
try:
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    # Force connection
    client.server_info()
    print("   ✅ Connection successful!")
    
    # Get database name from URI
    db_name = mongo_uri.split('/')[-1].split('?')[0]
    if not db_name:
        db_name = 'ffxiv_recruitment'
    
    print(f"\n3. Database: {db_name}")
    
    # List existing databases
    print("\n4. Available databases:")
    for db in client.list_database_names():
        print(f"   - {db}")
    
    # Check if our database exists
    if db_name in client.list_database_names():
        print(f"\n5. Collections in '{db_name}':")
        db = client[db_name]
        collections = db.list_collection_names()
        if collections:
            for coll in collections:
                count = db[coll].count_documents({})
                print(f"   - {coll} ({count} documents)")
        else:
            print("   (No collections yet - will be created on first insert)")
    else:
        print(f"\n5. Database '{db_name}' doesn't exist yet")
        print("   (Will be created automatically on first insert)")
    
    print("\n" + "=" * 50)
    print("✅ MongoDB is ready to use!")
    print("=" * 50)
    
except Exception as e:
    print(f"   ❌ Connection failed!")
    print(f"\n   Error: {str(e)}")
    print("\n" + "=" * 50)
    print("Troubleshooting Tips:")
    print("=" * 50)
    
    error_str = str(e).lower()
    
    if 'timeout' in error_str or 'timed out' in error_str:
        print("\n⚠️  Connection Timeout")
        print("   - Check if MongoDB is running (try: mongosh)")
        print("   - For Atlas: Check Network Access in MongoDB Atlas")
        print("   - Verify firewall isn't blocking the connection")
    
    elif 'authentication failed' in error_str or 'auth' in error_str:
        print("\n⚠️  Authentication Failed")
        print("   - Check username and password are correct")
        print("   - For Atlas: Verify database user exists")
        print("   - Special characters in password might need URL encoding")
    
    elif 'connection refused' in error_str:
        print("\n⚠️  Connection Refused")
        print("   - MongoDB is not running")
        print("   - Start it with: brew services start mongodb-community (macOS)")
        print("   - Or: sudo systemctl start mongod (Linux)")
        print("   - Or: net start MongoDB (Windows)")
    
    elif 'name or service not known' in error_str:
        print("\n⚠️  Hostname Not Found")
        print("   - Check your MongoDB URI is correct")
        print("   - For Atlas: Get fresh connection string from Atlas dashboard")
    
    else:
        print("\n⚠️  General Connection Error")
        print("   - Double-check your MONGO_URI in .env")
        print("   - Ensure MongoDB service is running")
        print("   - Check for typos in the connection string")
    
    print("\n" + "=" * 50)
    exit(1)