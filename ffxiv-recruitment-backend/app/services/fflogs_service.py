import requests
import base64
from datetime import datetime, timedelta
from flask import current_app

class FFLogsService:
    """Service for fetching FFXIV combat data from FFLogs API (v2 GraphQL)"""
    
    BASE_URL = "https://www.fflogs.com/api/v2"
    TOKEN_URL = "https://www.fflogs.com/oauth/token"
    
    _access_token = None
    _token_expires_at = None
    
    @classmethod
    def _get_access_token(cls):
        """Get or refresh OAuth access token"""
        # Check if we have a valid cached token
        if cls._access_token and cls._token_expires_at:
            if datetime.now() < cls._token_expires_at:
                return cls._access_token
        
        # Get credentials from config
        client_id = current_app.config.get('FFLOGS_CLIENT_ID')
        client_secret = current_app.config.get('FFLOGS_CLIENT_SECRET')
        
        if not client_id or not client_secret:
            raise ValueError("FFLogs credentials not configured")
        
        # Create Basic Auth header
        credentials = f"{client_id}:{client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        headers = {
            'Authorization': f'Basic {encoded_credentials}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        data = {
            'grant_type': 'client_credentials'
        }
        
        try:
            response = requests.post(cls.TOKEN_URL, headers=headers, data=data, timeout=10)
            response.raise_for_status()
            
            token_data = response.json()
            cls._access_token = token_data['access_token']
            
            # Set expiration (subtract 5 minutes for safety)
            expires_in = token_data.get('expires_in', 3600)
            cls._token_expires_at = datetime.now() + timedelta(seconds=expires_in - 300)
            
            return cls._access_token
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get FFLogs access token: {str(e)}")
    
    @classmethod
    def _make_graphql_request(cls, query, variables=None):
        """Make a GraphQL request to FFLogs API"""
        token = cls._get_access_token()
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'query': query,
            'variables': variables or {}
        }
        
        try:
            response = requests.post(
                f"{cls.BASE_URL}/client",
                headers=headers,
                json=payload,
                timeout=10
            )
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"FFLogs API request failed: {str(e)}")
    
    @classmethod
    def get_character_data(cls, lodestone_id):
        """
        Get character data from FFLogs
        
        Args:
            character_name: Character's first and last name (e.g., "Cloud Strife")
            server: Server name (e.g., "Gilgamesh")
            region: Region code (default: 'North America')
            
        Returns:
            dict with character data or error
        """
        query = """
        query($lodestone_id: Int!) {
            characterData {
                character(lodestoneID: $lodestone_id) {
                    id
                    lodestoneID
                    name
                    zoneRankings
                    hidden
                    server {
                        id
                        name
                        normalizedName
                        slug
                        region {
                            id
                            compactName
                            name
                            slug
                        }
                    }
                }
            }
        }
        """
        
        variables = {
            'lodestone_id': int(lodestone_id)
        }
        
        try:
            result = cls._make_graphql_request(query, variables)
            
            if 'errors' in result:
                return {
                    'success': False,
                    'error': result['errors'][0]['message']
                }
            
            character = result.get('data', {}).get('characterData', {}).get('character')
            
            if not character:
                return {
                    'success': False,
                    'error': 'Character not found on FFLogs'
                }
            
            if character.get('hidden'):
                return {
                    'success': False,
                    'error': 'Character profile is hidden'
                }
            
            return {
                'success': True,
                'fflogs_id': character['id'],
                'name': character['name'],
                'server': character['server']['name'],
                'region': character['server']['region'],
                'lodestone_id': character.get('lodestoneID')
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @classmethod
    def get_character_rankings(cls, character_name, server, region='NA', encounter_id=None):
        """
        Get character's raid rankings
        
        Args:
            character_name: Character name
            server: Server name
            region: Region code
            encounter_id: Specific encounter ID (optional)
            
        Returns:
            dict with rankings data
        """
        query = """
        query($name: String!, $server: String!, $region: String!) {
            characterData {
                character(name: $name, serverSlug: $server, serverRegion: $region) {
                    id
                    name
                    encounterRankings
                }
            }
        }
        """
        
        variables = {
            'name': character_name,
            'server': server,
            'region': region
        }
        
        try:
            result = cls._make_graphql_request(query, variables)
            
            if 'errors' in result:
                return {
                    'success': False,
                    'error': result['errors'][0]['message']
                }
            
            character = result.get('data', {}).get('characterData', {}).get('character')
            
            if not character:
                return {
                    'success': False,
                    'error': 'Character not found'
                }
            
            return {
                'success': True,
                'rankings': character.get('encounterRankings', {})
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @classmethod
    def get_character_progression(cls, character_name, server, region='NA'):
        """
        Get simplified character progression data
        
        Returns the highest difficulty cleared for recent raid tiers
        """
        # This is a simplified version - you can expand this based on your needs
        query = """
        query($name: String!, $server: String!, $region: String!) {
            characterData {
                character(name: $name, serverSlug: $server, serverRegion: $region) {
                    id
                    name
                }
            }
        }
        """
        
        variables = {
            'name': character_name,
            'server': server,
            'region': region
        }
        
        try:
            result = cls._make_graphql_request(query, variables)
            
            if 'errors' in result:
                return {
                    'success': False,
                    'error': result['errors'][0]['message']
                }
            
            character = result.get('data', {}).get('characterData', {}).get('character')
            
            if not character:
                return {
                    'success': False,
                    'error': 'Character not found'
                }
            
            # You can expand this to parse actual progression data
            return {
                'success': True,
                'fflogs_id': character['id'],
                'progression': {}
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    @classmethod
    def search_character(cls, name, server=None, region='NA'):
        """
        Search for characters by name
        
        Args:
            name: Character name (partial match)
            server: Optional server filter
            region: Region code
            
        Returns:
            List of matching characters
        """
        # Note: FFLogs API might not support fuzzy search directly
        # This is a basic implementation
        if not server:
            return {
                'success': False,
                'error': 'Server is required for character search'
            }
        
        return cls.get_character_data(name, server, region)