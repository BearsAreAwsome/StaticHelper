from functools import wraps
from flask import request, jsonify, current_app
import jwt
from bson import ObjectId
from app import get_db

def token_required(f):
    """Decorator to protect routes with JWT authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            # Decode token
            data = jwt.decode(
                token, 
                current_app.config['JWT_SECRET_KEY'], 
                algorithms=['HS256']
            )
            
            # Get user from database
            user = get_db().users.find_one({'_id': ObjectId(data['user_id'])})
            
            if not user:
                return jsonify({'message': 'User not found'}), 401
            
            # Add user to kwargs
            kwargs['current_user'] = user
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'message': f'Token validation failed: {str(e)}'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

def optional_token(f):
    """Decorator for routes that work with or without authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        current_user = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
                data = jwt.decode(
                    token, 
                    current_app.config['JWT_SECRET_KEY'], 
                    algorithms=['HS256']
                )
                current_user = get_db().users.find_one({'_id': ObjectId(data['user_id'])})
            except:
                pass  # Continue without user
        
        kwargs['current_user'] = current_user
        return f(*args, **kwargs)
    
    return decorated