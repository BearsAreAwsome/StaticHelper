"""
Pytest configuration and fixtures for Flask backend testing (using mongomock)
"""

import os
import pytest
import mongomock
from app import create_app


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
