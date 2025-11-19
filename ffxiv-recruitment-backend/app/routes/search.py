from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from bson import ObjectId
from app import get_db
from app.models.application import Application
from app.models.listing import Listing
from app.models.user import User
from app.middleware.auth_middleware import token_required, optional_token
import google.generativeai as genai
import os
import json
import hashlib

bp = Blueprint('search', __name__)

# Configure Gemini (moved to function to allow better error handling)
def configure_gemini():
    """Configure Gemini with API key"""
    api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY environment variable not set")
    genai.configure(api_key=api_key)
    return api_key

# Add OPTIONS handler for CORS preflight
@bp.route('/players', methods=['OPTIONS'])
@bp.route('/listings', methods=['OPTIONS'])
def handle_options():
    """Handle CORS preflight requests"""
    return '', 204

def get_users_collection():
    """Helper to get users collection"""
    return get_db().users

def get_listings_collection():
    """Helper to get listings collection"""
    return get_db().listings

@bp.route('/players', methods=['GET'])
@optional_token
def search_players(current_user=None):
    """Search for players based on criteria"""
    try:
        # Build query
        query = {}
        
        # Filter by data center
        data_center = request.args.get('data_center')
        if data_center:
            query['data_center'] = data_center
        
        # Filter by server
        server = request.args.get('server')
        if server:
            query['server'] = {'$regex': server, '$options': 'i'}
        
        # Filter by role
        role = request.args.get('role')
        if role:
            query['roles'] = role
        
        # Pagination
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))
        skip = (page - 1) * per_page
        
        # Exclude current user if authenticated
        if current_user:
            query['_id'] = {'$ne': ObjectId(current_user['_id'])}
        
        # Get players
        players_cursor = get_users_collection().find(query).skip(skip).limit(per_page)
        total = get_users_collection().count_documents(query)
        
        players = []
        for player_data in players_cursor:
            player = {
                'id': str(player_data['_id']),
                'username': player_data['username'],
                'character_name': player_data.get('character_name'),
                'server': player_data.get('server'),
                'data_center': player_data.get('data_center'),
                'bio': player_data.get('bio'),
                'roles': player_data.get('roles', []),
                'progression': player_data.get('progression', {}),
                'availability': player_data.get('availability', [])
            }
            players.append(player)
        
        return jsonify({
            'players': players,
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to search players: {str(e)}'}), 500

@bp.route('/listings', methods=['GET'])
@optional_token
def search_listings(current_user=None):
    """Search for listings (enhanced search)"""
    try:
        # Build query
        query = {}
        
        # Only show recruiting and filled listings to non-owners
        if current_user:
            query['$or'] = [
                {'state': {'$in': ['recruiting', 'filled']}},
                {'owner_id': ObjectId(current_user['_id'])}
            ]
        else:
            query['state'] = {'$in': ['recruiting', 'filled']}
        
        # Text search
        search_text = request.args.get('q')
        if search_text:
            query['$or'] = [
                {'title': {'$regex': search_text, '$options': 'i'}},
                {'description': {'$regex': search_text, '$options': 'i'}},
                {'content_name': {'$regex': search_text, '$options': 'i'}}
            ]
        
        # Filter by data center
        data_center = request.args.get('data_center')
        if data_center:
            query['data_center'] = data_center
        
        # Filter by content type
        content_type = request.args.get('content_type')
        if content_type:
            query['content_type'] = content_type
        
        # Filter by server
        server = request.args.get('server')
        if server:
            query['server'] = server
        
        # Filter by state
        state = request.args.get('state')
        if state and current_user:
            if state == 'private':
                query = {'owner_id': ObjectId(current_user['_id']), 'state': 'private'}
            else:
                query['state'] = state
        
        # Pagination
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        skip = (page - 1) * per_page
        
        # Get listings
        listings_cursor = get_listings_collection().find(query).sort('created_at', -1).skip(skip).limit(per_page)
        total = get_listings_collection().count_documents(query)
        
        listings = []
        for listing_data in listings_cursor:
            # Get owner info
            owner = get_users_collection().find_one({'_id': listing_data['owner_id']})
            
            listing = {
                'id': str(listing_data['_id']),
                'title': listing_data['title'],
                'description': listing_data['description'],
                'content_type': listing_data['content_type'],
                'content_name': listing_data.get('content_name'),
                'data_center': listing_data['data_center'],
                'server': listing_data.get('server'),
                'state': listing_data['state'],
                'roles_needed': listing_data.get('roles_needed', {}),
                'schedule': listing_data.get('schedule', []),
                'application_count': listing_data.get('application_count', 0),
                'created_at': listing_data['created_at'].isoformat() if listing_data.get('created_at') else None
            }
            
            if owner:
                listing['owner'] = {
                    'id': str(owner['_id']),
                    'username': owner['username'],
                    'character_name': owner.get('character_name'),
                    'server': owner.get('server')
                }
            
            listings.append(listing)
        
        return jsonify({
            'listings': listings,
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to search listings: {str(e)}'}), 500

@bp.route('/recommended', methods=['GET'])
@token_required
def get_recommended_listings(current_user):
    """Get personalized listing recommendations using Gemini AI"""
    try:
        # Configure Gemini API
        try:
            api_key = configure_gemini()
            print(f"Gemini API configured with key: {api_key[:10]}...")
        except ValueError as e:
            return jsonify({'message': str(e)}), 500
        # Get user profile data
        user_profile = {
            'character_name': current_user.get('character_name'),
            'server': current_user.get('server'),
            'data_center': current_user.get('data_center'),
            'roles': current_user.get('roles', []),
            'bio': current_user.get('bio'),
            'progression': current_user.get('progression', {}),
            'availability': current_user.get('availability', [])
        }
        
        # Get all recruiting listings (excluding user's own)
        query = {
            'state': 'recruiting',
            'owner_id': {'$ne': ObjectId(current_user['_id'])}
        }
        
        listings_cursor = get_listings_collection().find(query).sort('created_at', -1)
        
        # Format listings for Gemini
        listings_data = []
        listings_map = {}  # Keep track of full listing data
        
        for listing_data in listings_cursor:
            listing_id = str(listing_data['_id'])
            
            # Get owner info
            owner = get_users_collection().find_one({'_id': listing_data['owner_id']})
            
            # Create simplified listing for Gemini
            simplified_listing = {
                'id': listing_id,
                'title': listing_data['title'],
                'description': listing_data['description'],
                'content_type': listing_data['content_type'],
                'content_name': listing_data.get('content_name'),
                'data_center': listing_data['data_center'],
                'server': listing_data.get('server'),
                'roles_needed': listing_data.get('roles_needed', {}),
                'schedule': listing_data.get('schedule', [])
            }
            
            listings_data.append(simplified_listing)
            
            # Store full listing data for response
            full_listing = {
                'id': listing_id,
                'title': listing_data['title'],
                'description': listing_data['description'],
                'content_type': listing_data['content_type'],
                'content_name': listing_data.get('content_name'),
                'data_center': listing_data['data_center'],
                'server': listing_data.get('server'),
                'state': listing_data['state'],
                'roles_needed': listing_data.get('roles_needed', {}),
                'schedule': listing_data.get('schedule', []),
                'created_at': listing_data['created_at'].isoformat() if listing_data.get('created_at') else None
            }
            
            if owner:
                full_listing['owner'] = {
                    'id': str(owner['_id']),
                    'username': owner['username'],
                    'character_name': owner.get('character_name'),
                    'server': owner.get('server')
                }
            
            listings_map[listing_id] = full_listing
        
        # If no listings available, return empty
        if not listings_data:
            return jsonify({'recommendations': []}), 200
        
        # Call Gemini for recommendations
        recommendations = get_gemini_recommendations(user_profile, listings_data)
        
        # Enhance recommendations with full listing data
        enhanced_recommendations = []
        for rec in recommendations:
            listing_id = rec['listing_id']
            if listing_id in listings_map:
                enhanced_rec = {
                    'listing': listings_map[listing_id],
                    'matchScore': rec['match_score'],
                    'reasons': rec['reasons']
                }
                enhanced_recommendations.append(enhanced_rec)
        
        return jsonify({'recommendations': enhanced_recommendations}), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get recommendations: {str(e)}'}), 500

def get_gemini_recommendations(user_profile, listings):
    """Use Gemini to generate personalized recommendations"""
    try:
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-2.0-flash-lite')
        
        # Create prompt for Gemini
        prompt = f"""You are an expert matchmaker for Final Fantasy XIV raid groups and static formations. 
        
Your task is to analyze a player's profile and recommend the most suitable raid listings for them.

PLAYER PROFILE:
{json.dumps(user_profile, indent=2)}

AVAILABLE LISTINGS:
{json.dumps(listings, indent=2)}

SCORING CRITERIA (0-100 points):
1. Data Center Match (CRITICAL - 50 points max):
   - Same data center: 50 points
   - Different data center: 0 points (cannot play together)

2. Server Match (15 points max):
   - Same server: 15 points
   - Different server but same data center: 0 points

3. Role Match (25 points max):
   - Player's roles match roles_needed in listing
   - Each matching role: 10 points (max 25)

4. Content Type & Progression (10 points max):
   - Player's progression aligns with listing's content
   - Consider content_type and content_name

5. Schedule & Availability (5 points):
   - Schedule times align with player availability

6. Experience & Engagement (5 points):
   - Player has detailed bio and progression history

IMPORTANT RULES:
- Only recommend listings from the same data center as the player
- Prioritize listings where the player's roles are needed
- Consider schedule compatibility
- Provide 3-5 specific, personalized reasons for each recommendation
- Return TOP 10 recommendations, sorted by match_score (highest first)

OUTPUT FORMAT (JSON only, no markdown):
{{
  "recommendations": [
    {{
      "listing_id": "exact_id_from_listings",
      "match_score": 85,
      "reasons": [
        "You're on the same data center (Aether)",
        "Your Tank role is needed - they need 1 Tank",
        "They're recruiting for Savage content which matches your progression",
        "Same server (Gilgamesh) for easier coordination",
        "Raid times align with your availability"
      ]
    }}
  ]
}}

Respond ONLY with valid JSON. No markdown, no explanations, just the JSON object."""

        # Generate recommendations
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up response (remove markdown if present)
        if response_text.startswith('```json'):
            response_text = response_text.replace('```json', '').replace('```', '').strip()
        elif response_text.startswith('```'):
            response_text = response_text.replace('```', '').strip()
        
        # Parse JSON response
        result = json.loads(response_text)
        
        return result.get('recommendations', [])
        
    except json.JSONDecodeError as e:
        print(f"Failed to parse Gemini response: {e}")
        print(f"Raw response: {response_text}")
        # Fallback to empty recommendations
        return []
    except Exception as e:
        print(f"Gemini API error: {e}")
        # Fallback to empty recommendations
        return []