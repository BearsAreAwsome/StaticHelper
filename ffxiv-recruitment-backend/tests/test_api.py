"""
Fixed test file for Flask API endpoints
Place this in: ffxiv-recruitment-backend/tests/test_api.py
"""

import pytest
import json
from bson import ObjectId


class TestHealthCheck:
    """Test health check and basic endpoints"""
    
    def test_health_endpoint(self, client):
        """Test that health check endpoint returns 200"""
        response = client.get('/health')
        assert response.status_code == 200
        
    def test_api_root(self, client):
        """Test API root endpoint"""
        response = client.get('/api/')
        assert response.status_code in [200, 404]


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_login_with_valid_credentials(self, client, sample_user):
        """Test login with valid credentials"""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'testpass'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'token' in data
    
    def test_login_with_invalid_credentials(self, client):
        """Test login with invalid credentials"""
        response = client.post('/api/auth/login', json={
            'email': 'wronguser@example.com',
            'password': 'wrongpass'
        })
        
        assert response.status_code in [401, 403]
    
    def test_register_new_user(self, client):
        """Test user registration"""
        response = client.post('/api/auth/register', json={
            'username': 'newuser',
            'email': 'newuser@gmail.com',
            'password': 'newpass123'
        })
        
        assert response.status_code in [200, 201]


class TestListings:
    """Test listing CRUD operations"""
    
    def test_get_all_listings(self, client):
        """Test retrieving all listings"""
        response = client.get('/api/listings/')
        assert response.status_code == 200
        data = response.get_json()
        assert 'listings' in data
        assert 'total' in data
        assert 'page' in data
        assert isinstance(data['listings'], list)
    
    def test_get_single_listing(self, client, app, sample_user):
        """Test retrieving a single listing"""
        # Create a listing first
        listing_data = {
            '_id': ObjectId(),
            'title': 'Test Listing',
            'description': 'Test description',
            'owner_id': sample_user['_id'],
            'content_type': 'savage',
            'data_center': 'Primal',
            'server': 'Excalibur',
            'state': 'recruiting',
            'application_count': 0
        }
        app.db.listings.insert_one(listing_data)
        
        listing_id = str(listing_data['_id'])
        response = client.get(f'/api/listings/{listing_id}')
        assert response.status_code == 200
        data = response.get_json()
        assert data['id'] == listing_id
    
    def test_get_nonexistent_listing(self, client):
        """Test retrieving a non-existent listing"""
        fake_id = str(ObjectId())
        response = client.get(f'/api/listings/{fake_id}')
        assert response.status_code == 404
    
    def test_get_invalid_listing_id(self, client):
        """Test retrieving with invalid listing ID"""
        response = client.get('/api/listings/invalid_id')
        assert response.status_code == 400
    
    def test_create_listing_authenticated(self, client, auth_headers):
        """Test creating a new listing with authentication"""
        response = client.post('/api/listings/', 
            headers=auth_headers,
            json={
                'title': 'New Static',
                'description': 'Looking for DPS',
                'server': 'Excalibur',
                'data_center': 'Primal',
                'content_type': 'savage',
                'state': 'recruiting'
            }
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['title'] == 'New Static'
        assert data['description'] == 'Looking for DPS'
        assert data['content_type'] == 'savage'
    
    def test_create_listing_unauthenticated(self, client):
        """Test that creating a listing without auth fails"""
        response = client.post('/api/listings/', json={
            'title': 'New Static',
            'description': 'Looking for DPS',
            'content_type': 'savage',
            'data_center': 'Primal'
        })
        
        assert response.status_code in [401, 403]
    
    def test_create_listing_missing_required_fields(self, client, auth_headers):
        """Test creating listing with missing required fields"""
        response = client.post('/api/listings/',
            headers=auth_headers,
            json={
                'title': 'Incomplete Listing'
                # Missing description, content_type, data_center
            }
        )
        
        assert response.status_code == 400
    
    def test_update_listing(self, client, auth_headers, app, sample_user):
        """Test updating an existing listing"""
        # Create a listing first
        listing_data = {
            '_id': ObjectId(),
            'title': 'Original Title',
            'description': 'Original description',
            'owner_id': sample_user['_id'],
            'content_type': 'savage',
            'data_center': 'Primal',
            'state': 'private',
            'application_count': 0
        }
        app.db.listings.insert_one(listing_data)
        
        listing_id = str(listing_data['_id'])
        response = client.put(
            f'/api/listings/{listing_id}',
            headers=auth_headers,
            json={
                'title': 'Updated Static Title',
                'description': 'Updated description'
            }
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['title'] == 'Updated Static Title'
        assert data['description'] == 'Updated description'
    
    def test_update_listing_unauthorized(self, client, auth_headers, app):
        """Test updating a listing owned by another user"""
        # Create a listing owned by different user
        other_user_id = ObjectId()
        listing_data = {
            '_id': ObjectId(),
            'title': 'Other User Listing',
            'description': 'Test',
            'owner_id': other_user_id,
            'content_type': 'savage',
            'data_center': 'Primal',
            'state': 'private',
            'application_count': 0
        }
        app.db.listings.insert_one(listing_data)
        
        listing_id = str(listing_data['_id'])
        response = client.put(
            f'/api/listings/{listing_id}',
            headers=auth_headers,
            json={'title': 'Hacked Title'}
        )
        
        assert response.status_code == 403
    
    def test_delete_listing(self, client, auth_headers, app, sample_user):
        """Test deleting a listing"""
        # Create a listing first
        listing_data = {
            '_id': ObjectId(),
            'title': 'To Be Deleted',
            'description': 'Test',
            'owner_id': sample_user['_id'],
            'content_type': 'savage',
            'data_center': 'Primal',
            'state': 'private',
            'application_count': 0
        }
        app.db.listings.insert_one(listing_data)
        
        listing_id = str(listing_data['_id'])
        response = client.delete(
            f'/api/listings/{listing_id}',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        
        # Verify it's deleted
        verify_response = client.get(f'/api/listings/{listing_id}')
        assert verify_response.status_code == 404
    
    def test_delete_listing_unauthorized(self, client, auth_headers, app):
        """Test deleting a listing owned by another user"""
        other_user_id = ObjectId()
        listing_data = {
            '_id': ObjectId(),
            'title': 'Protected Listing',
            'description': 'Test',
            'owner_id': other_user_id,
            'content_type': 'savage',
            'data_center': 'Primal',
            'state': 'private',
            'application_count': 0
        }
        app.db.listings.insert_one(listing_data)
        
        listing_id = str(listing_data['_id'])
        response = client.delete(
            f'/api/listings/{listing_id}',
            headers=auth_headers
        )
        
        assert response.status_code == 403
    
    def test_change_listing_state(self, client, auth_headers, app, sample_user):
        """Test changing listing state"""
        listing_data = {
            '_id': ObjectId(),
            'title': 'State Change Test',
            'description': 'Test',
            'owner_id': sample_user['_id'],
            'content_type': 'savage',
            'data_center': 'Primal',
            'state': 'private',
            'application_count': 0
        }
        app.db.listings.insert_one(listing_data)
        
        listing_id = str(listing_data['_id'])
        response = client.patch(
            f'/api/listings/{listing_id}/state',
            headers=auth_headers,
            json={'state': 'recruiting'}
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['state'] == 'recruiting'
    
    def test_change_listing_state_invalid(self, client, auth_headers, app, sample_user):
        """Test changing listing state to invalid value"""
        listing_data = {
            '_id': ObjectId(),
            'title': 'State Test',
            'description': 'Test',
            'owner_id': sample_user['_id'],
            
            'data_center': 'Primal',
            'state': 'private',
            'application_count': 0
        }
        app.db.listings.insert_one(listing_data)
        
        listing_id = str(listing_data['_id'])
        response = client.patch(
            f'/api/listings/{listing_id}/state',
            headers=auth_headers,
            json={'state': 'invalid_state'}
        )
        
        assert response.status_code == 400
    
    def test_get_my_listings(self, client, auth_headers, app, sample_user):
        """Test retrieving current user's listings"""
        # Create multiple listings for the user
        for i in range(3):
            listing_data = {
                '_id': ObjectId(),
                'title': f'My Listing {i}',
                'description': 'Test',
                'owner_id': sample_user['_id'],
                'content_type': 'savage',
                'data_center': 'Primal',
                'state': 'private',
                'application_count': 0
            }
            app.db.listings.insert_one(listing_data)
        
        response = client.get('/api/listings/my-listings', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'listings' in data
        assert len(data['listings']) == 3


class TestFilters:
    """Test filtering and search functionality"""
    
    def test_filter_by_server(self, client, app, sample_user):
        """Test filtering listings by server"""
        # Create listings with different servers
        for server in ['Excalibur', 'Leviathan', 'Excalibur']:
            listing_data = {
                '_id': ObjectId(),
                'title': f'{server} Listing',
                'description': 'Test',
                'owner_id': sample_user['_id'],
                'content_type': 'savage',
                'data_center': 'Primal',
                'server': server,
                'state': 'recruiting',
                'application_count': 0
            }
            app.db.listings.insert_one(listing_data)
        
        response = client.get('/api/listings/?server=Excalibur')
        assert response.status_code == 200
        data = response.get_json()
        assert data['total'] == 2
    
    def test_filter_by_data_center(self, client, app, sample_user):
        """Test filtering listings by data center"""
        for dc in ['Primal', 'Aether', 'Primal']:
            listing_data = {
                '_id': ObjectId(),
                'title': 'Test',
                'description': 'Test',
                'owner_id': sample_user['_id'],
                'content_type': 'savage',
                'data_center': dc,
                'state': 'recruiting',
                'application_count': 0
            }
            app.db.listings.insert_one(listing_data)
        
        response = client.get('/api/listings/?data_center=Primal')
        assert response.status_code == 200
        data = response.get_json()
        assert data['total'] == 2
    
    def test_filter_by_content_type(self, client, app, sample_user):
        """Test filtering listings by content type"""
        for content in ['savage', 'ultimate', 'savage']:
            listing_data = {
                '_id': ObjectId(),
                'title': 'Test',
                'description': 'Test',
                'owner_id': sample_user['_id'],
                'content_type': content,
                'data_center': 'Primal',
                'state': 'recruiting',
                'application_count': 0
            }
            app.db.listings.insert_one(listing_data)
        
        response = client.get('/api/listings/?content_type=savage')
        assert response.status_code == 200
        data = response.get_json()
        assert data['total'] == 2
    
    def test_pagination(self, client, app, sample_user):
        """Test pagination"""
        # Create 25 listings
        for i in range(25):
            listing_data = {
                '_id': ObjectId(),
                'title': f'Listing {i}',
                'description': 'Test',
                'owner_id': sample_user['_id'],
                'content_type': 'savage',
                'data_center': 'Primal',
                'state': 'recruiting',
                'application_count': 0
            }
            app.db.listings.insert_one(listing_data)
        
        # Test first page
        response = client.get('/api/listings/?page=1&per_page=10')
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['listings']) == 10
        assert data['page'] == 1
        assert data['total'] == 25
        
        # Test second page
        response = client.get('/api/listings/?page=2&per_page=10')
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['listings']) == 10
        assert data['page'] == 2


class TestPrivateListings:
    """Test private listing visibility"""
    
    def test_private_listing_not_visible_to_others(self, client, app):
        """Test that private listings are not visible to non-owners"""
        user_id = ObjectId()
        listing_data = {
            '_id': ObjectId(),
            'title': 'Private Listing',
            'description': 'Test',
            'owner_id': user_id,
            'content_type': 'savage',
            'data_center': 'Primal',
            'state': 'private',
            'application_count': 0
        }
        app.db.listings.insert_one(listing_data)
        
        # Unauthenticated request
        response = client.get('/api/listings/')
        data = response.get_json()
        assert data['total'] == 0
    
    def test_private_listing_visible_to_owner(self, client, auth_headers, app, sample_user):
        """Test that private listings are visible to their owners"""
        listing_data = {
            '_id': ObjectId(),
            'title': 'My Private Listing',
            'description': 'Test',
            'owner_id': sample_user['_id'],
            'content_type': 'savage',
            'data_center': 'Primal',
            'state': 'private',
            'application_count': 0
        }
        app.db.listings.insert_one(listing_data)
        
        response = client.get('/api/listings/', headers=auth_headers)
        data = response.get_json()
        assert data['total'] == 1


class TestValidation:
    """Test input validation"""
    
    def test_invalid_json(self, client, auth_headers):
        """Test handling of invalid JSON"""
        response = client.post(
            '/api/listings/',
            headers=auth_headers,
            data='invalid json',
            content_type='application/json'
        )
        
        assert response.status_code in [400, 422, 500]
    
    def test_missing_required_fields(self, client, auth_headers):
        """Test handling of missing required fields"""
        response = client.post(
            '/api/listings/',
            headers=auth_headers,
            json={'title': 'Only Title'}
        )
        
        assert response.status_code == 400


@pytest.mark.integration
class TestIntegration:
    """Integration tests for complete workflows"""
    
    def test_full_recruitment_workflow(self, client, db_session):
        """Test complete recruitment workflow from creation to state change"""
        # Register user
        register_response = client.post('/api/auth/register', json={
            'username': 'recruiter',
            'email': 'recruiter@gmail.com',
            'password': 'pass123'
        })
        assert register_response.status_code in [200, 201]
        
        # Login
        login_response = client.post('/api/auth/login', json={
            'email': 'recruiter@gmail.com',
            'password': 'pass123'
        })
        token = login_response.get_json().get('token')
        headers = {'Authorization': f'Bearer {token}'}
        
        # Create listing
        create_response = client.post('/api/listings/',
            headers=headers,
            json={
                'title': 'Savage Static',
                'description': 'Looking for healers',
                'server': 'Excalibur',
                'data_center': 'Primal',
                'content_type': 'savage',
                'state': 'private'
            }
        )
        assert create_response.status_code == 201
        listing_id = create_response.get_json()['id']
        
        # Change state to recruiting
        state_response = client.patch(
            f'/api/listings/{listing_id}/state',
            headers=headers,
            json={'state': 'recruiting'}
        )
        assert state_response.status_code == 200
        
        # Retrieve listing (now visible publicly)
        get_response = client.get(f'/api/listings/{listing_id}')
        assert get_response.status_code == 200
        listing_data = get_response.get_json()
        assert listing_data['state'] == 'recruiting'
        
        # Update listing
        update_response = client.put(
            f'/api/listings/{listing_id}',
            headers=headers,
            json={'title': 'Updated Savage Static'}
        )
        assert update_response.status_code == 200
        
        # Get my listings
        my_listings_response = client.get('/api/listings/my-listings', headers=headers)
        assert my_listings_response.status_code == 200
        my_listings = my_listings_response.get_json()['listings']
        assert len(my_listings) == 1
        
        # Delete listing
        delete_response = client.delete(
            f'/api/listings/{listing_id}',
            headers=headers
        )
        assert delete_response.status_code == 200