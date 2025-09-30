from flask import Blueprint

bp = Blueprint('messages', __name__)

@bp.route('/', methods=['GET'])
def get_messages():
    """Get all messages - placeholder"""
    return {'message': 'Messages endpoint - coming soon'}, 200