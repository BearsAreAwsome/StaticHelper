from flask import Blueprint, request, jsonify
from datetime import datetime
from bson import ObjectId
from app import get_db
from app.models.user import User
from app.middleware.auth_middleware import token_required
from app.services.fflogs_service import FFLogsService

bp = Blueprint('fflogs', __name__)

def get_users_collection():
    """Helper to get users collection"""
    return get_db().users

@bp.route('/link', methods=['POST'])
@token_required
def link_fflogs(current_user):
    """
    Link user's FFLogs character data
    
    Body:
        character_name: Character name (e.g., "Cloud Strife")
        server: Server name (e.g., "Gilgamesh")
        region: Region code (default: 'NA')
    """
    try:
        data = request.get_json()
        lodestone_id = data.get('lodestone_id', '').strip()
        
        if not lodestone_id:
            return jsonify({'message': 'Error with lodestone_id'}), 400
        
        # Fetch character data from FFLogs
        fflogs_data = FFLogsService.get_character_data(lodestone_id)
        
        if not fflogs_data['success']:
            return jsonify({
                'message': 'Failed to fetch FFLogs data',
                'error': fflogs_data.get('error')
            }), 400
        
        # Update user with FFLogs data
        update_data = {
            'fflogs_id': fflogs_data.get('fflogs_id'),
            'character_name': fflogs_data.get('name'),
            'server': fflogs_data.get('server'),
            'fflogs_region': fflogs_data.get('region'),
            'fflogs_linked_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # If FFLogs has lodestone ID and user doesn't, update it
        if fflogs_data.get('lodestone_id') and not current_user.get('lodestone_id'):
            update_data['lodestone_id'] = fflogs_data['lodestone_id']
        
        get_users_collection().update_one(
            {'_id': ObjectId(current_user['_id'])},
            {'$set': update_data}
        )
        
        # Return updated user data
        updated_user_data = get_users_collection().find_one({'_id': ObjectId(current_user['_id'])})
        user = User.from_dict(updated_user_data)
        user._id = updated_user_data['_id']
        
        return jsonify({
            'message': 'FFLogs account linked successfully!',
            'user': user.to_dict(include_sensitive=True),
            'fflogs_data': fflogs_data
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to link FFLogs account: {str(e)}'}), 500


@bp.route('/verify', methods=['POST'])
@token_required
def verify_fflogs(current_user):
    """
    Verify and refresh FFLogs character data
    """
    try:
        fflogs_id = current_user.get('fflogs_id')
        character_name = current_user.get('character_name')
        server = current_user.get('server')
        region = current_user.get('fflogs_region', 'NA')
        
        if not character_name or not server:
            return jsonify({'message': 'User has no linked FFLogs account'}), 400
        
        # Fetch latest character data
        fflogs_data = FFLogsService.get_character_data(character_name, server, region)
        
        if not fflogs_data['success']:
            return jsonify({
                'message': 'Failed to fetch FFLogs data',
                'error': fflogs_data.get('error')
            }), 400
        
        # Update user data from FFLogs
        update_data = {
            'fflogs_id': fflogs_data.get('fflogs_id'),
            'character_name': fflogs_data.get('name'),
            'server': fflogs_data.get('server'),
            'fflogs_region': fflogs_data.get('region'),
            'fflogs_verified_at': datetime.utcnow(),
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
            'message': 'FFLogs data verified and updated!',
            'user': user.to_dict(include_sensitive=True),
            'fflogs_data': fflogs_data
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to verify FFLogs account: {str(e)}'}), 500


@bp.route('/unlink', methods=['POST'])
@token_required
def unlink_fflogs(current_user):
    """Unlink user's FFLogs account"""
    try:
        get_users_collection().update_one(
            {'_id': ObjectId(current_user['_id'])},
            {
                '$unset': {
                    'fflogs_id': '',
                    'fflogs_region': '',
                    'fflogs_linked_at': '',
                    'fflogs_verified_at': ''
                },
                '$set': {'updated_at': datetime.utcnow()}
            }
        )
        
        updated_user_data = get_users_collection().find_one({'_id': ObjectId(current_user['_id'])})
        user = User.from_dict(updated_user_data)
        user._id = updated_user_data['_id']
        
        return jsonify({
            'message': 'FFLogs account unlinked',
            'user': user.to_dict(include_sensitive=True)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to unlink FFLogs account: {str(e)}'}), 500


@bp.route('/rankings/<user_id>', methods=['GET'])
def get_user_rankings(user_id):
    """
    Get FFLogs rankings for a user (public endpoint)
    """
    try:
        if not ObjectId.is_valid(user_id):
            return jsonify({'message': 'Invalid user ID'}), 400
        
        user_data = get_users_collection().find_one({'_id': ObjectId(user_id)})
        
        if not user_data:
            return jsonify({'message': 'User not found'}), 404
        
        character_name = user_data.get('character_name')
        server = user_data.get('server')
        region = user_data.get('fflogs_region', 'NA')
        
        if not character_name or not server:
            return jsonify({'message': 'User has no linked FFLogs account'}), 404
        
        # Get rankings from FFLogs
        rankings_data = FFLogsService.get_character_rankings(character_name, server, region)
        
        if not rankings_data['success']:
            return jsonify({
                'message': 'Failed to fetch rankings',
                'error': rankings_data.get('error')
            }), 400
        
        return jsonify({
            'rankings': rankings_data.get('rankings', {}),
            'character_name': character_name,
            'server': server
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get rankings: {str(e)}'}), 500


@bp.route('/progression/<user_id>', methods=['GET'])
def get_user_progression(user_id):
    """
    Get FFLogs progression for a user (public endpoint)
    """
    try:
        if not ObjectId.is_valid(user_id):
            return jsonify({'message': 'Invalid user ID'}), 400
        
        user_data = get_users_collection().find_one({'_id': ObjectId(user_id)})
        
        if not user_data:
            return jsonify({'message': 'User not found'}), 404
        
        character_name = user_data.get('character_name')
        server = user_data.get('server')
        region = user_data.get('fflogs_region', 'NA')
        
        if not character_name or not server:
            return jsonify({'message': 'User has no linked FFLogs account'}), 404
        
        # Get progression from FFLogs
        progression_data = FFLogsService.get_character_progression(character_name, server, region)
        
        if not progression_data['success']:
            return jsonify({
                'message': 'Failed to fetch progression',
                'error': progression_data.get('error')
            }), 400
        
        return jsonify({
            'progression': progression_data.get('progression', {}),
            'character_name': character_name,
            'server': server
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get progression: {str(e)}'}), 500


@bp.route('/search', methods=['GET'])
def search_character():
    """
    Search for a character on FFLogs
    
    Query params:
        name: Character name
        server: Server name
        region: Region (default: NA)
    """
    try:
        character_name = request.args.get('name', '').strip()
        server = request.args.get('server', '').strip()
        region = request.args.get('region', 'NA').strip()
        
        if not character_name or not server:
            return jsonify({'message': 'Character name and server are required'}), 400
        
        result = FFLogsService.get_character_data(character_name, server, region)
        
        if not result['success']:
            return jsonify({
                'message': 'Character not found',
                'error': result.get('error')
            }), 404
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'message': f'Search failed: {str(e)}'}), 500