"""
Pytest configuration and fixtures for Flask backend testing (using mongomock)
"""

import os
import pytest
import mongomock
from app import create_app
import bcrypt
import pytest
from bson import ObjectId


@pytest.fixture(scope="session")
def app():
    """Create and configure a Flask app instance for testing."""
    os.environ["FLASK_ENV"] = "testing"
    os.environ["TESTING"] = "True"

    # Create the Flask app
    app = create_app()

    # Use an in-memory mongomock database instead of a real MongoDB server
    mock_client = mongomock.MongoClient()
    mock_db = mock_client.get_database("ffxiv_recruitment_test")

    # Patch the app to use the mock DB
    app.mongo_client = mock_client
    app.db = mock_db

    yield app

    # (Optional) Clear after session
    mock_client.drop_database("ffxiv_recruitment_test")


@pytest.fixture(scope="function")
def client(app):
    """Provide a test client for API requests."""
    return app.test_client()


@pytest.fixture(scope="function")
def runner(app):
    """Provide a CLI runner for testing Flask commands."""
    return app.test_cli_runner()


@pytest.fixture(autouse=True)
def clean_db(app):
    """Automatically clear MongoDB collections before each test."""
    for name in app.db.list_collection_names():
        app.db.drop_collection(name)
    yield
    

@pytest.fixture(scope="function")
def sample_user(app):
    """Create a sample user document in the MongoDB mock."""
    user_data = {
        "_id": ObjectId(),
        "username": "testuser",
        "email": "test@example.com",
        "password": bcrypt.hashpw(b"testpass", bcrypt.gensalt()).decode("utf-8"),
    }

    app.db.users.insert_one(user_data)
    return user_data


@pytest.fixture(scope="function")
def sample_static_listing(app, sample_user):
    """Create a sample static listing document tied to a user."""
    listing_data = {
        "_id": ObjectId(),
        "title": "Test Static",
        "description": "Looking for members",
        "user_id": sample_user["_id"],
        "role": "DPS",
        "world": "Midgardsormr",
    }

    app.db.listings.insert_one(listing_data)
    return listing_data