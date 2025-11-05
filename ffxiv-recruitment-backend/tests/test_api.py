"""
Sample test file for Flask API endpoints
Place this in: ffxiv-recruitment-backend/tests/test_api.py
"""

import pytest
import json


class TestHealthCheck:
    """Test health check and basic endpoints"""
    
    def test_health_endpoint(self, client):
        """Test that health check endpoint returns 200"""
        response = client.get('/health')
        assert response.status_code == 200
        
    def test_api_root(self, client):
        """Test API root endpoint"""
        response = client.get('/api/')
        assert response.status_code in [200, 404]  # Adjust based on your API


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_login_with_valid_credentials(self, client, sample_user):
        """Test login with valid credentials"""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'testpass'
        })
        
        # Adjust assertions based on your API response
        assert response.status_code == 200
        data = response.get_json()
        assert 'access_token' in data or 'token' in data
    
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
            'email': 'newuser@example.com',
            'password': 'newpass123'
        })
        
        assert response.status_code in [200, 201]


class TestStaticListings:
    """Test static listing CRUD operations"""
    
    def test_get_all_listings(self, client):
        """Test retrieving all static listings"""
        response = client.get('/api/listings')
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, (list, dict))
    
    def test_get_single_listing(self, client, sample_static_listing):
        """Test retrieving a single static listing"""
        listing_id = str(sample_static_listing['_id']).replace("ObjectId('", "").replace("')", "")
        response = client.get(f'/api/listings/{listing_id}')
        assert response.status_code == 200
        data = response.get_json()
        assert data['_id'] == sample_static_listing.id
    
    def test_create_listing_authenticated(self, client, auth_headers):
        """Test creating a new static listing with authentication"""
        response = client.post('/api/listings', 
            headers=auth_headers,
            json={
                'title': 'New Static',
                'description': 'Looking for DPS',
                'server': 'Excalibur',
                'data_center': 'Primal',
                'content_type' : 'savage'

            }
        )
        
        assert response.status_code in [200, 201]
        data = response.get_json()
        assert data['title'] == 'New Static'
    
    def test_create_listing_unauthenticated(self, client):
        """Test that creating a listing without auth fails"""
        response = client.post('/api/listings', json={
            'title': 'New Static',
            'description': 'Looking for DPS'
        })
        
        assert response.status_code in [401, 403]
    
    def test_update_listing(self, client, auth_headers, sample_static_listing):
        """Test updating an existing static listing"""
        response = client.put(
            f'/api/listings/{sample_static_listing["_id"]}',
            headers=auth_headers,
            json={
                'title': 'Updated Static Title'
            }
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['title'] == 'Updated Static Title'
    
    def test_delete_listing(self, client, auth_headers, sample_static_listing):
        """Test deleting a static listing"""
        response = client.delete(
            f'/api/listings/{sample_static_listing.id}',
            headers=auth_headers
        )
        
        assert response.status_code in [200, 204]


class TestFilters:
    """Test filtering and search functionality"""
    
    def test_filter_by_server(self, client):
        """Test filtering listings by server"""
        response = client.get('/api/listings?server=Excalibur')
        assert response.status_code == 200
        data = response.get_json()
        # Add assertions based on your response structure
    
    def test_filter_by_role(self, client):
        """Test filtering listings by role"""
        response = client.get('/api/listings?role=tank')
        assert response.status_code == 200
    
    def test_search_listings(self, client):
        """Test search functionality"""
        response = client.get('/api/listings?search=savage')
        assert response.status_code == 200


class TestValidation:
    """Test input validation"""
    
    def test_invalid_json(self, client, auth_headers):
        """Test handling of invalid JSON"""
        response = client.post(
            '/api/statics',
            headers=auth_headers,
            data='invalid json',
            content_type='application/json'
        )
        
        assert response.status_code in [400, 422]
    
    def test_missing_required_fields(self, client, auth_headers):
        """Test handling of missing required fields"""
        response = client.post(
            '/api/statics',
            headers=auth_headers,
            json={}  # Empty payload
        )
        
        assert response.status_code in [400, 422]


class TestErrorHandling:
    """Test error handling"""
    
    def test_404_for_nonexistent_listing(self, client):
        """Test 404 for non-existent listing"""
        response = client.get('/api/statics/99999')
        assert response.status_code == 404
    
    # def test_method_not_allowed(self, client):
    #     """Test method not allowed"""
    #     response = client.patch('/api/')
    #     assert response.status_code == 405


@pytest.mark.integration
class TestIntegration:
    """Integration tests for complete workflows"""
    
    def test_full_recruitment_workflow(self, client, db_session):
        """Test complete recruitment workflow from creation to application"""
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
        create_response = client.post('/api/listings',
            headers=headers,
            json={
                'title': 'Savage Static',
                'description': 'Looking for healers',
                'server': 'Excalibur',
                'data_center': 'Primal',
                'content_type' : 'savage'
            }
        )
        assert create_response.status_code in [200, 201]
        listing_id = create_response.get_json()['id']
        
        # Retrieve listing
        get_response = client.get(f'/api/listings?id={listing_id}')
        assert get_response.status_code == 200
        
        # Apply to listing (if you have applications)
        # apply_response = client.post(f'/api/statics/{listing_id}/apply',
        #     headers=headers,
        #     json={'message': 'I want to join!'}
        # )
        # assert apply_response.status_code in [200, 201]