from flask import Blueprint

bp = Blueprint('search', __name__)

@bp.route('/players', methods=['GET'])
def search_players():
    """Search players - placeholder"""
    return {'message': 'Search players endpoint - coming soon'}, 200

@bp.route('/listings', methods=['GET'])
def search_listings():
    """Search listings - placeholder"""
    return {'message': 'Search listings endpoint - coming soon'}, 200