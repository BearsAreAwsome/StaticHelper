from flask import Blueprint

bp = Blueprint('users', __name__)

@bp.route('/', methods=['GET'])
def get_users():
    """Get all users - placeholder"""
    return {'message': 'Users endpoint - coming soon'}, 200