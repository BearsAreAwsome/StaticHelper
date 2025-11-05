from flask import Blueprint, request, jsonify
from datetime import datetime
from bson import ObjectId
from app import get_db
from app.models.application import Application
from app.models.listing import Listing
from app.models.user import User
from app.middleware.auth_middleware import token_required

bp = Blueprint('users', __name__)
@bp.route('/recommended', methods=['GET'])
@token_required
def get_recommended_listings(current_user):
    """Get personalized listing recommendations for current user"""
    try:
        # Get user's data center and roles
        user_data_center = current_user.get('data_center')
        user_roles = current_user.get('roles', [])
        
        # Build query for recruiting listings
        query = {'state': 'recruiting'}
        
        # Exclude user's own listings
        query['owner_id'] = {'$ne': ObjectId(current_user['_id'])}
        
        # Get all recruiting listings
        listings_cursor = get_listings_collection().find(query).sort('created_at', -1)
        
        recommendations = []
        
        for listing_data in listings_cursor:
            # Calculate match score
            match_score = calculate_match_score(current_user, listing_data)
            
            if match_score > 0:  # Only include if there's some match
                # Get reasons for match
                reasons = get_match_reasons(current_user, listing_data)
                
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
                    'created_at': listing_data['created_at'].isoformat() if listing_data.get('created_at') else None
                }
                
                if owner:
                    listing['owner'] = {
                        'id': str(owner['_id']),
                        'username': owner['username'],
                        'character_name': owner.get('character_name')
                    }
                
                recommendation = {
                    'listing': listing,
                    'matchScore': match_score,
                    'reasons': reasons
                }
                
                recommendations.append(recommendation)
        
        # Sort by match score (highest first)
        recommendations.sort(key=lambda x: x['matchScore'], reverse=True)
        
        return jsonify({'recommendations': recommendations}), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get recommendations: {str(e)}'}), 500

def calculate_match_score(user, listing):
    """Calculate match score between user and listing (0-100)"""
    score = 0
    
    # Data center match (most important - up to 50 points)
    if user.get('data_center') and user['data_center'] == listing.get('data_center'):
        score += 50
    elif user.get('data_center'):
        # Different data center, no score
        return 0
    
    # Server match (bonus - up to 15 points)
    if user.get('server') and listing.get('server') and user['server'] == listing['server']:
        score += 15
    
    # Role match (up to 25 points)
    user_roles = user.get('roles', [])
    roles_needed = listing.get('roles_needed', {})
    
    if user_roles and roles_needed:
        needed_roles = [r for r, count in roles_needed.items() if count > 0]
        matching_roles = sum(1 for role in user_roles if role.lower() in [r.lower() for r in needed_roles])
        if matching_roles > 0:
            score += min(matching_roles * 10, 25)
    
    # Has bio (engagement indicator - 5 points)
    if user.get('bio'):
        score += 5
    
    # Has progression (experience indicator - 5 points)
    if user.get('progression') and len(user['progression']) > 0:
        score += 5
    
    return min(score, 100)

def get_match_reasons(user, listing):
    """Get reasons why user matches this listing"""
    reasons = []
    
    # Data center match
    if user.get('data_center') and user['data_center'] == listing.get('data_center'):
        reasons.append(f"You're on {listing.get('data_center')} data center")
    
    # Server match
    if user.get('server') and listing.get('server') and user['server'] == listing['server']:
        reasons.append(f"Same server: {listing.get('server')}")
    
    # Role match
    user_roles = user.get('roles', [])
    roles_needed = listing.get('roles_needed', {})
    
    if user_roles and roles_needed:
        needed_roles = [r for r, count in roles_needed.items() if count > 0]
        matching = [role for role in user_roles if role.lower() in [r.lower() for r in needed_roles]]
        if matching:
            reasons.append(f"You play {', '.join(matching)} (needed)")
    
    # Content type
    if listing.get('content_type'):
        reasons.append(f"Looking for {listing['content_type'].capitalize()} raiders")
    
    # Schedule alignment
    if listing.get('schedule') and user.get('availability'):
        reasons.append(f"Raid schedule may work for you")
    
    return reasons[:5]  # Return top 5 reasonsfrom flask import Blueprint, request, jsonify
from bson import ObjectId
from app import get_db
from app.middleware.auth_middleware import optional_token

bp = Blueprint('search', __name__)

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