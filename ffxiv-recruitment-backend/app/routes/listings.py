from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from bson import ObjectId
from app import get_db
from app.models.listing import Listing
from app.middleware.auth_middleware import token_required, optional_token

bp = Blueprint('listings', __name__)

def get_listings_collection():
    """Helper to get listings collection"""
    return get_db().listings

def get_users_collection():
    """Helper to get users collection"""
    return get_db().users

@bp.route('/', methods=['GET'])
@optional_token
def get_listings(current_user=None):
    """Get all listings with optional filtering"""
    try:
        # Build filter query
        query = {}
        
        # Only show recruiting and filled listings to non-owners
        # (private listings only visible to owner)
        if current_user:
            query['$or'] = [
                {'state': {'$in': ['recruiting', 'filled']}},
                {'owner_id': ObjectId(current_user['_id'])}
            ]
        else:
            query['state'] = {'$in': ['recruiting', 'filled']}
        
        # Apply filters from query params
        data_center = request.args.get('data_center')
        if data_center:
            query['data_center'] = data_center
        
        content_type = request.args.get('content_type')
        if content_type:
            query['content_type'] = content_type
        
        server = request.args.get('server')
        if server:
            query['server'] = server
        
        state = request.args.get('state')
        if state and current_user:  # Only filter by state if authenticated
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
            
            listing = Listing.from_dict(listing_data)
            listing._id = listing_data['_id']
            
            listing_dict = listing.to_dict()
            if owner:
                listing_dict['owner'] = {
                    'id': str(owner['_id']),
                    'username': owner['username'],
                    'character_name': owner.get('character_name'),
                    'server': owner.get('server')
                }
            
            listings.append(listing_dict)
        
        return jsonify({
            'listings': listings,
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get listings: {str(e)}'}), 500

@bp.route('/<listing_id>', methods=['GET'])
@optional_token
def get_listing(listing_id, current_user=None):
    """Get a single listing by ID"""
    try:
        if not ObjectId.is_valid(listing_id):
            return jsonify({'message': 'Invalid listing ID'}), 400
        
        listing_data = get_listings_collection().find_one({'_id': ObjectId(listing_id)})
        
        if not listing_data:
            return jsonify({'message': 'Listing not found'}), 404
        
        # Check if user can view this listing
        if listing_data['state'] == 'private':
            if not current_user or str(listing_data['owner_id']) != str(current_user['_id']):
                return jsonify({'message': 'Listing not found'}), 404
        
        # Get owner info
        owner = get_users_collection().find_one({'_id': listing_data['owner_id']})
        
        listing = Listing.from_dict(listing_data)
        listing._id = listing_data['_id']
        
        listing_dict = listing.to_dict()
        if owner:
            listing_dict['owner'] = {
                'id': str(owner['_id']),
                'username': owner['username'],
                'character_name': owner.get('character_name'),
                'server': owner.get('server'),
                'data_center': owner.get('data_center')
            }
        
        # Check if current user is the owner
        if current_user:
            listing_dict['is_owner'] = str(listing_data['owner_id']) == str(current_user['_id'])
        
        return jsonify(listing_dict), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get listing: {str(e)}'}), 500

@bp.route('/', methods=['POST'])
@token_required
def create_listing(current_user):
    """Create a new listing"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'content_type', 'data_center']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'{field} is required'}), 400
        
        # Create listing
        listing_data = {
            'title': data['title'],
            'description': data['description'],
            'owner_id': ObjectId(current_user['_id']),
            'content_type': data['content_type'],
            'content_name': data.get('content_name'),
            'data_center': data['data_center'],
            'server': data.get('server'),
            'roles_needed': data.get('roles_needed', {}),
            'schedule': data.get('schedule', []),
            'requirements': data.get('requirements', {}),
            'voice_chat': data.get('voice_chat'),
            'additional_info': data.get('additional_info', ''),
            'state': data.get('state', 'private'),
            'application_count': 0,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = get_listings_collection().insert_one(listing_data)
        listing_data['_id'] = result.inserted_id
        
        listing = Listing.from_dict(listing_data)
        listing._id = result.inserted_id
        
        return jsonify(listing.to_dict()), 201
        
    except Exception as e:
        return jsonify({'message': f'Failed to create listing: {str(e)}'}), 500

@bp.route('/<listing_id>', methods=['PUT'])
@token_required
def update_listing(listing_id, current_user):
    """Update a listing"""
    try:
        if not ObjectId.is_valid(listing_id):
            return jsonify({'message': 'Invalid listing ID'}), 400
        
        listing_data = get_listings_collection().find_one({'_id': ObjectId(listing_id)})
        
        if not listing_data:
            return jsonify({'message': 'Listing not found'}), 404
        
        # Check ownership
        if str(listing_data['owner_id']) != str(current_user['_id']):
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Check if listing can be edited
        listing = Listing.from_dict(listing_data)
        if not listing.can_edit():
            return jsonify({'message': 'Listing cannot be edited in its current state'}), 400
        
        data = request.get_json()
        
        # Update fields
        update_data = {
            'updated_at': datetime.utcnow()
        }
        
        allowed_fields = [
            'title', 'description', 'content_type', 'content_name',
            'data_center', 'server', 'roles_needed', 'schedule',
            'requirements', 'voice_chat', 'additional_info', 'state'
        ]
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        get_listings_collection().update_one(
            {'_id': ObjectId(listing_id)},
            {'$set': update_data}
        )
        
        # Get updated listing
        updated_listing_data = get_listings_collection().find_one({'_id': ObjectId(listing_id)})
        updated_listing = Listing.from_dict(updated_listing_data)
        updated_listing._id = updated_listing_data['_id']
        
        return jsonify(updated_listing.to_dict()), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to update listing: {str(e)}'}), 500

@bp.route('/<listing_id>', methods=['DELETE'])
@token_required
def delete_listing(listing_id, current_user):
    """Delete a listing"""
    try:
        if not ObjectId.is_valid(listing_id):
            return jsonify({'message': 'Invalid listing ID'}), 400
        
        listing_data = get_listings_collection().find_one({'_id': ObjectId(listing_id)})
        
        if not listing_data:
            return jsonify({'message': 'Listing not found'}), 404
        
        # Check ownership
        if str(listing_data['owner_id']) != str(current_user['_id']):
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Delete the listing
        get_listings_collection().delete_one({'_id': ObjectId(listing_id)})
        
        # TODO: Also delete associated applications
        
        return jsonify({'message': 'Listing deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to delete listing: {str(e)}'}), 500

@bp.route('/<listing_id>/state', methods=['PATCH'])
@token_required
def change_listing_state(listing_id, current_user):
    """Change listing state (private/recruiting/filled)"""
    try:
        if not ObjectId.is_valid(listing_id):
            return jsonify({'message': 'Invalid listing ID'}), 400
        
        listing_data = get_listings_collection().find_one({'_id': ObjectId(listing_id)})
        
        if not listing_data:
            return jsonify({'message': 'Listing not found'}), 404
        
        # Check ownership
        if str(listing_data['owner_id']) != str(current_user['_id']):
            return jsonify({'message': 'Unauthorized'}), 403
        
        data = request.get_json()
        new_state = data.get('state')
        
        if not new_state or new_state not in ['private', 'recruiting', 'filled']:
            return jsonify({'message': 'Invalid state. Must be private, recruiting, or filled'}), 400
        
        # Update state
        get_listings_collection().update_one(
            {'_id': ObjectId(listing_id)},
            {'$set': {'state': new_state, 'updated_at': datetime.utcnow()}}
        )
        
        # Get updated listing
        updated_listing_data = get_listings_collection().find_one({'_id': ObjectId(listing_id)})
        updated_listing = Listing.from_dict(updated_listing_data)
        updated_listing._id = updated_listing_data['_id']
        
        return jsonify(updated_listing.to_dict()), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to change state: {str(e)}'}), 500

@bp.route('/my-listings', methods=['GET'])
@token_required
def get_my_listings(current_user):
    """Get all listings owned by current user"""
    try:
        listings_cursor = get_listings_collection().find(
            {'owner_id': ObjectId(current_user['_id'])}
        ).sort('created_at', -1)
        
        listings = []
        for listing_data in listings_cursor:
            listing = Listing.from_dict(listing_data)
            listing._id = listing_data['_id']
            listings.append(listing.to_dict())
        
        return jsonify({'listings': listings}), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get listings: {str(e)}'}), 500