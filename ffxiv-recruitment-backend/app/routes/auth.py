from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import jwt
from bson import ObjectId
from app import get_db
from app.models.user import User
from app.middleware.auth_middleware import token_required
from email_validator import validate_email, EmailNotValidError

bp = Blueprint('auth', __name__)

def get_users_collection():
    """Helper to get users collection"""
    return get_db().users

@bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'{field} is required'}), 400
        
        # Validate email format
        try:
            validated = validate_email(data['email'])
            email = validated.email
        except EmailNotValidError as e:
            return jsonify({'message': str(e)}), 400
        
        # Check if user already exists
        if get_users_collection().find_one({'email': email}):
            return jsonify({'message': 'Email already registered'}), 400
        
        if get_users_collection().find_one({'username': data['username']}):
            return jsonify({'message': 'Username already taken'}), 400
        
        # Create user
        password_hash = User.hash_password(data['password'])
        
        user_data = {
            'username': data['username'],
            'email': email,
            'password_hash': password_hash,
            'character_name': data.get('character_name'),
            'server': data.get('server'),
            'data_center': data.get('data_center'),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = get_users_collection().insert_one(user_data)
        user_data['_id'] = result.inserted_id
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': str(result.inserted_id),
            'exp': datetime.utcnow() + current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        # Create user object for response
        user = User.from_dict(user_data)
        user._id = result.inserted_id
        
        return jsonify({
            'token': token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500

@bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Email and password are required'}), 400
        
        # Find user
        user_data = get_users_collection().find_one({'email': data['email']})
        
        if not user_data:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Verify password
        if not User.verify_password(data['password'], user_data['password_hash']):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': str(user_data['_id']),
            'exp': datetime.utcnow() + current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        # Create user object
        user = User.from_dict(user_data)
        user._id = user_data['_id']
        
        return jsonify({
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Login failed: {str(e)}'}), 500

@bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Get current user profile"""
    try:
        user = User.from_dict(current_user)
        user._id = current_user['_id']
        return jsonify(user.to_dict(include_sensitive=True)), 200
    except Exception as e:
        return jsonify({'message': f'Failed to get user: {str(e)}'}), 500

@bp.route('/refresh', methods=['POST'])
@token_required
def refresh_token(current_user):
    """Refresh JWT token"""
    try:
        # Generate new token
        token = jwt.encode({
            'user_id': str(current_user['_id']),
            'exp': datetime.utcnow() + current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        return jsonify({'token': token}), 200
    except Exception as e:
        return jsonify({'message': f'Token refresh failed: {str(e)}'}), 500