from flask import Blueprint

bp = Blueprint('applications', __name__)

@bp.route('/', methods=['GET'])
def get_applications():
    """Get all applications - placeholder"""
    return {'message': 'Applications endpoint - coming soon'}, 200