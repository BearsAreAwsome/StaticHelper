"""
Pytest configuration and fixtures for Flask backend testing
Place this file in: ffxiv-recruitment-backend/tests/conftest.py
"""

import pytest
import os
from app import create_app, db  # Adjust import based on your app structure


@pytest.fixture(scope='session')
def app():
    """Create application instance for testing"""
    # Set test configuration
    os.environ['FLASK_ENV'] = 'testing'
    os.environ['TESTING'] = 'True'
    
    # Create app with test config
    app = create_app('testing')  # Or however you initialize your app
    
    # Establish application context
    with app.app_context():
        # Create all database tables
        db.create_all()
        
        yield app
        
        # Cleanup
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope='function')
def client(app):
    """Create a test client for the app"""
    return app.test_client()


@pytest.fixture(scope='function')
def runner(app):
    """Create a CLI runner for testing Flask commands"""
    return app.test_cli_runner()


@pytest.fixture(scope='function')
def db_session(app):
    """Create a new database session for a test"""
    with app.app_context():
        connection = db.engine.connect()
        transaction = connection.begin()
        
        # Bind session to connection
        session = db.session
        
        yield session
        
        # Rollback transaction
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture(scope='function')
def auth_headers(client):
    """
    Create authentication headers for testing protected endpoints
    Adjust based on your authentication method (JWT, sessions, etc.)
    """
    # Example for JWT authentication
    # You'll need to adjust this based on your auth implementation
    
    # Login or create a test user
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    
    if response.status_code == 200:
        token = response.json.get('access_token')
        return {'Authorization': f'Bearer {token}'}
    
    return {}


@pytest.fixture(scope='function')
def sample_user(db_session):
    """Create a sample user for testing"""
    from app import User  # Adjust import based on your models
    
    user = User(
        username='testuser',
        email='test@example.com',
        # Add other required fields
    )
    user.set_password('testpass')  # If you have password hashing
    
    db_session.add(user)
    db_session.commit()
    
    return user


@pytest.fixture(scope='function')
def sample_static_listing(db_session, sample_user):
    """Create a sample static listing for testing"""
    from app import StaticListing  # Adjust import
    
    listing = StaticListing(
        title='Test Static',
        description='Looking for members',
        user_id=sample_user.id,
        # Add other fields specific to your model
    )
    
    db_session.add(listing)
    db_session.commit()
    
    return listing


@pytest.fixture(autouse=True)
def reset_db(db_session):
    """Automatically reset database between tests"""
    yield
    # Cleanup happens automatically with db_session fixture