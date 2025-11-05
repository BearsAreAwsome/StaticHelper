"""
Test script for Listings API
Run this after starting the Flask server
"""
import requests
import json

BASE_URL = "http://localhost:5000/api"

def print_response(response, title):
    print(f"\n{'='*50}")
    print(f"{title}")
    print(f"{'='*50}")
    print(f"Status: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")

def test_listings():
    # Step 1: Register a user
    print("\n🔵 Step 1: Register a test user")
    register_data = {
        "username": "recruiter1",
        "email": "recruiter1@gmail.com",
        "password": "password123",
        "character_name": "Cloud Strife",
        "server": "Gilgamesh",
        "data_center": "Aether"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    print_response(response, "Register User")
    
    if response.status_code != 201:
        print("❌ Registration failed. User might already exist.")
        # Try logging in instead
        login_data = {
            "email": "recruiter1@example.com",
            "password": "password123"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print_response(response, "Login User")
    
    token = response.json().get('token')
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 2: Create a listing
    print("\n🔵 Step 2: Create a listing")
    listing_data = {
        "title": "M4S Static LF Tank & Healer",
        "description": "Looking for experienced Tank and Healer for week 1 clear progression",
        "content_type": "savage",
        "content_name": "Anabaseios Savage",
        "data_center": "Aether",
        "server": "Gilgamesh",
        "roles_needed": {
            "tank": 1,
            "healer": 1
        },
        "schedule": ["Tuesday 8PM EST", "Thursday 8PM EST"],
        "requirements": {
            "min_ilvl": 630,
            "experience": "Previous savage experience required"
        },
        "voice_chat": "Discord",
        "additional_info": "Friendly group, LGBTQ+ friendly",
        "state": "private"
    }
    
    response = requests.post(f"{BASE_URL}/listings", json=listing_data, headers=headers)
    print_response(response, "Create Listing")
    
    if response.status_code == 201:
        listing_id = response.json().get('id')
    else:
        print("❌ Failed to create listing")
        return
    
    # Step 3: Get the listing
    print("\n🔵 Step 3: Get the created listing")
    response = requests.get(f"{BASE_URL}/listings/{listing_id}", headers=headers)
    print_response(response, "Get Listing")
    
    # Step 4: Update listing to recruiting
    print("\n🔵 Step 4: Change listing state to 'recruiting'")
    response = requests.patch(
        f"{BASE_URL}/listings/{listing_id}/state",
        json={"state": "recruiting"},
        headers=headers
    )
    print_response(response, "Change State to Recruiting")
    
    # Step 5: Update listing details
    print("\n🔵 Step 5: Update listing details")
    update_data = {
        "title": "M4S Static LF Tank & Healer [UPDATED]",
        "roles_needed": {
            "tank": 1,
            "healer": 1,
            "dps": 1
        }
    }
    response = requests.put(f"{BASE_URL}/listings/{listing_id}", json=update_data, headers=headers)
    print_response(response, "Update Listing")
    
    # Step 6: Get all listings (should include our recruiting one)
    print("\n🔵 Step 6: Get all listings")
    response = requests.get(f"{BASE_URL}/listings")
    print_response(response, "Get All Listings")
    
    # Step 7: Filter by data center
    print("\n🔵 Step 7: Filter listings by data center")
    response = requests.get(f"{BASE_URL}/listings?data_center=Aether")
    print_response(response, "Filter by Data Center")
    
    # Step 8: Get my listings
    print("\n🔵 Step 8: Get my listings")
    response = requests.get(f"{BASE_URL}/listings/my-listings", headers=headers)
    print_response(response, "Get My Listings")
    
    # Step 9: Change state to filled
    print("\n🔵 Step 9: Change listing state to 'filled'")
    response = requests.patch(
        f"{BASE_URL}/listings/{listing_id}/state",
        json={"state": "filled"},
        headers=headers
    )
    print_response(response, "Change State to Filled")
    
    # Step 10: Try to edit filled listing (should fail based on state pattern)
    print("\n🔵 Step 10: Try to edit filled listing (should fail)")
    response = requests.put(
        f"{BASE_URL}/listings/{listing_id}",
        json={"title": "Should not work"},
        headers=headers
    )
    print_response(response, "Try to Edit Filled Listing")
    
    # Step 11: Delete listing
    print("\n🔵 Step 11: Delete listing")
    response = requests.delete(f"{BASE_URL}/listings/{listing_id}", headers=headers)
    print_response(response, "Delete Listing")
    
    # Step 12: Try to get deleted listing
    print("\n🔵 Step 12: Try to get deleted listing (should fail)")
    response = requests.get(f"{BASE_URL}/listings/{listing_id}", headers=headers)
    print_response(response, "Get Deleted Listing")
    
    print("\n" + "="*50)
    print("✅ All tests completed!")
    print("="*50)

if __name__ == "__main__":
    try:
        test_listings()
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("Make sure the Flask server is running on http://localhost:5000")