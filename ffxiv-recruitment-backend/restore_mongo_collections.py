from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from app import get_db

# --- Restore users collection ---
users_data = [
    {
        "_id": ObjectId("68dd45b311f09c90e47337d4"),
        "username": "Brooke",
        "email": "duvallbmg@cofc.edu",
        "password_hash": "$2b$12$9pG1US4qhHUG5BKpLJ1SY7u3tieH32FyGV5tnaj5/FIQgDTKrqmk2S",
        "character_name": "Brooke Shadowfire",
        "server": "Brynhildr",
        "data_center": "Crystal",
        "created_at": datetime.fromisoformat("2025-10-01T15:16:03.357+00:00"),
        "updated_at": datetime.fromisoformat("2025-10-01T15:16:03.357+00:00")
    }
]

# --- Restore listings collection ---
listings_data = [
    {
        "_id": ObjectId("68e673ff389e114341abc4fa"),
        "title": "M4S Static LF Tank & Healer [UPDATED]",
        "description": "Looking for experienced Tank and Healer for week 1 clear progression",
        "owner_id": ObjectId("68e673ff389e114341abc4f9"),
        "content_type": "savage",
        "content_name": "Anabaseios Savage",
        "data_center": "Aether",
        "server": "Gilgamesh",
        "roles_needed": {"tank": 1, "healer": 1, "dps": 1},
        "schedule": ["Tuesday 8PM EST", "Thursday 8PM EST"],
        "requirements": {
            "min_ilvl": 630,
            "experience": "Previous savage experience required"
        },
        "voice_chat": "Discord",
        "additional_info": "Friendly group, LGBTQ+ friendly",
        "state": "filled",
        "application_count": 0,
        "created_at": datetime.fromisoformat("2025-10-08T14:23:59.245+00:00"),
        "updated_at": datetime.fromisoformat("2025-10-08T14:23:59.920+00:00")
    }
]

# --- Insert data into collections ---
mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
db = client.get_database("ffxiv_recruitment")
db.users.insert_many(users_data)
db.listings.insert_many(listings_data)

print("✅ Collections successfully restored with Sample Data!")
