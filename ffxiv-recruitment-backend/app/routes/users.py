from flask import Blueprint, request, jsonify
from datetime import datetime
from bson import ObjectId
from app import get_db
from app.models.user import User
from app.middleware.auth_middleware import token_required
from app.services.lodestone_service import LodestoneService

bp = Blueprint('users', __name__)

@bp.route('/profile', methods=['OPTIONS'])
@bp.route('/<user_id>', methods=['OPTIONS'])
@bp.route('/lodestone/link', methods=['OPTIONS'])
@bp.route('/lodestone/verify', methods=['OPTIONS'])
def handle_options(user_id=None):
    """Handle CORS preflight requests"""
    return '', 204

def get_users_collection():
    """Helper to get users collection"""
    return get_db().users

@bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """Get current user's profile"""
    try:
        user = User.from_dict(current_user)
        user._id = current_user['_id']
        return jsonify(user.to_dict(include_sensitive=True)), 200
    except Exception as e:
        return jsonify({'message': f'Failed to get profile: {str(e)}'}), 500

@bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update current user's profile"""
    try:
        data = request.get_json()
        
        # Build update data
        update_data = {
            'updated_at': datetime.utcnow()
        }
        
        # Allowed fields to update
        allowed_fields = [
            'character_name', 'server', 'data_center', 'bio',
            'availability', 'roles', 'lodestone_id', 'fflogs_id'
        ]
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        # Update user
        get_users_collection().update_one(
            {'_id': ObjectId(current_user['_id'])},
            {'$set': update_data}
        )
        
        # Get updated user
        updated_user_data = get_users_collection().find_one({'_id': ObjectId(current_user['_id'])})
        user = User.from_dict(updated_user_data)
        user._id = updated_user_data['_id']
        
        return jsonify(user.to_dict(include_sensitive=True)), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to update profile: {str(e)}'}), 500

@bp.route('/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get public user profile"""
    try:
        if not ObjectId.is_valid(user_id):
            return jsonify({'message': 'Invalid user ID'}), 400
        
        user_data = get_users_collection().find_one({'_id': ObjectId(user_id)})
        
        if not user_data:
            return jsonify({'message': 'User not found'}), 404
        
        user = User.from_dict(user_data)
        user._id = user_data['_id']
        
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get user: {str(e)}'}), 500

@bp.route('/', methods=['GET'])
def get_users():
    """Get all users (public endpoint - use for admin features)"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))
        skip = (page - 1) * per_page
        
        users_cursor = get_users_collection().find().skip(skip).limit(per_page)
        total = get_users_collection().count_documents({})
        
        users = []
        for user_data in users_cursor:
            user = User.from_dict(user_data)
            user._id = user_data['_id']
            users.append(user.to_dict())
        
        return jsonify({
            'users': users,
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get users: {str(e)}'}), 500

@bp.route('/lodestone/link', methods=['POST'])
@token_required
def link_lodestone(current_user):
    """
    Link a user's account to their Lodestone character
    
    Body:
        lodestone_id: The numeric ID from the Lodestone URL
    """
    try:
        data = request.get_json()
        lodestone_id = data.get('lodestone_id', '').strip()
        
        if not lodestone_id:
            return jsonify({'message': 'Lodestone ID is required'}), 400
        
        # Validate that it's numeric
        if not lodestone_id.isdigit():
            return jsonify({'message': 'Lodestone ID must be numeric'}), 400
        
        # Fetch character data to verify the Lodestone ID is valid
        lodestone_data = LodestoneService.fetch_character_data(lodestone_id)
        
        if not lodestone_data['success']:
            return jsonify({
                'message': 'Failed to fetch Lodestone data. Please verify the ID is correct.',
                'error': lodestone_data.get('error')
            }), 400
        
        # Update user with lodestone_id and character data from Lodestone
        update_data = {
            'lodestone_id': lodestone_id,
            'character_name': lodestone_data.get('character_name'),
            'server': lodestone_data.get('server'),
            'data_center': lodestone_data.get('data_center'),
            'updated_at': datetime.utcnow()
        }
        
        get_users_collection().update_one(
            {'_id': ObjectId(current_user['_id'])},
            {'$set': update_data}
        )
        
        # Return updated user data
        updated_user_data = get_users_collection().find_one({'_id': ObjectId(current_user['_id'])})
        user = User.from_dict(updated_user_data)
        user._id = updated_user_data['_id']
        
        return jsonify({
            'message': 'Lodestone account linked successfully!',
            'user': user.to_dict(include_sensitive=True),
            'character_data': lodestone_data
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to link Lodestone account: {str(e)}'}), 500


@bp.route('/lodestone/verify', methods=['POST'])
@token_required
def verify_lodestone(current_user):
    """
    Verify and refresh Lodestone character data
    
    This endpoint fetches the latest data from Lodestone and updates the user's profile
    """
    try:
        lodestone_id = current_user.get('lodestone_id')
        
        if not lodestone_id:
            return jsonify({'message': 'User has no linked Lodestone account'}), 400
        
        # Fetch latest character data
        lodestone_data = LodestoneService.fetch_character_data(lodestone_id)
        
        if not lodestone_data['success']:
            return jsonify({
                'message': 'Failed to fetch Lodestone data',
                'error': lodestone_data.get('error')
            }), 400
        
        # Update user data from Lodestone
        update_data = {
            'character_name': lodestone_data.get('character_name'),
            'server': lodestone_data.get('server'),
            'data_center': lodestone_data.get('data_center'),
            'grand_company': lodestone_data.get('grand_company'),
            'free_company': lodestone_data.get('free_company'),
            'lodestone_verified_at': datetime.utcnow()
        }
        
        get_users_collection().update_one(
            {'_id': ObjectId(current_user['_id'])},
            {'$set': update_data}
        )
        
        # Return updated user data
        updated_user_data = get_users_collection().find_one({'_id': ObjectId(current_user['_id'])})
        user = User.from_dict(updated_user_data)
        user._id = updated_user_data['_id']
        
        return jsonify({
            'message': 'Lodestone data verified and updated!',
            'user': user.to_dict(include_sensitive=True),
            'character_data': lodestone_data
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to verify Lodestone account: {str(e)}'}), 500


@bp.route('/lodestone/unlink', methods=['POST'])
@token_required
def unlink_lodestone(current_user):
    """Unlink a user's Lodestone account"""
    try:
        get_users_collection().update_one(
            {'_id': ObjectId(current_user['_id'])},
            {'$unset': {'lodestone_id': '', 'lodestone_verified_at': ''}}
        )
        
        updated_user_data = get_users_collection().find_one({'_id': ObjectId(current_user['_id'])})
        user = User.from_dict(updated_user_data)
        user._id = updated_user_data['_id']
        
        return jsonify({
            'message': 'Lodestone account unlinked',
            'user': user.to_dict(include_sensitive=True)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to unlink Lodestone account: {str(e)}'}), 500