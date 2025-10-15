from flask import Blueprint, request, jsonify
from datetime import datetime
from bson import ObjectId
from app import get_db
from app.models.application import Application
from app.models.listing import Listing
from app.models.user import User
from app.middleware.auth_middleware import token_required

bp = Blueprint('applications', __name__)

# Add OPTIONS handler for CORS preflight
@bp.route('/', methods=['OPTIONS'])
@bp.route('/<application_id>', methods=['OPTIONS'])
@bp.route('/<application_id>/status', methods=['OPTIONS'])
def handle_options(application_id=None):
    """Handle CORS preflight requests"""
    return '', 204

def get_applications_collection():
    """Helper to get applications collection"""
    return get_db().applications

def get_listings_collection():
    """Helper to get listings collection"""
    return get_db().listings

def get_users_collection():
    """Helper to get users collection"""
    return get_db().users

@bp.route('/', methods=['POST'])
@token_required
def create_application(current_user):
    """Apply to a listing"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'listing_id' not in data:
            return jsonify({'message': 'listing_id is required'}), 400
        
        listing_id = data['listing_id']
        
        # Validate listing ID
        if not ObjectId.is_valid(listing_id):
            return jsonify({'message': 'Invalid listing ID'}), 400
        
        # Get listing
        listing_data = get_listings_collection().find_one({'_id': ObjectId(listing_id)})
        
        if not listing_data:
            return jsonify({'message': 'Listing not found'}), 404
        
        # Check if listing accepts applications
        listing = Listing.from_dict(listing_data)
        if not listing.can_apply():
            return jsonify({'message': 'This listing is not accepting applications'}), 400
        
        # Check if user is the owner
        if str(listing_data['owner_id']) == str(current_user['_id']):
            return jsonify({'message': 'You cannot apply to your own listing'}), 400
        
        # Check if already applied
        existing_app = get_applications_collection().find_one({
            'listing_id': ObjectId(listing_id),
            'applicant_id': ObjectId(current_user['_id'])
        })
        
        if existing_app:
            return jsonify({'message': 'You have already applied to this listing'}), 400
        
        # Create application
        application_data = {
            'listing_id': ObjectId(listing_id),
            'applicant_id': ObjectId(current_user['_id']),
            'status': 'pending',
            'message': data.get('message', ''),
            'availability': data.get('availability', []),
            'preferred_roles': data.get('preferred_roles', []),
            'experience': data.get('experience', ''),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = get_applications_collection().insert_one(application_data)
        application_data['_id'] = result.inserted_id
        
        # Update listing application count
        get_listings_collection().update_one(
            {'_id': ObjectId(listing_id)},
            {'$inc': {'application_count': 1}}
        )
        
        # Create application object
        application = Application.from_dict(application_data)
        application._id = result.inserted_id
        
        return jsonify(application.to_dict()), 201
        
    except Exception as e:
        return jsonify({'message': f'Failed to create application: {str(e)}'}), 500

@bp.route('/', methods=['GET'])
@token_required
def get_my_applications(current_user):
    """Get all applications by current user"""
    try:
        applications_cursor = get_applications_collection().find(
            {'applicant_id': ObjectId(current_user['_id'])}
        ).sort('created_at', -1)
        
        applications = []
        for app_data in applications_cursor:
            # Get listing info
            listing = get_listings_collection().find_one({'_id': app_data['listing_id']})
            
            application = Application.from_dict(app_data)
            application._id = app_data['_id']
            
            app_dict = application.to_dict()
            if listing:
                app_dict['listing'] = {
                    'id': str(listing['_id']),
                    'title': listing['title'],
                    'content_type': listing['content_type'],
                    'data_center': listing['data_center'],
                    'state': listing['state']
                }
            
            applications.append(app_dict)
        
        return jsonify({'applications': applications}), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get applications: {str(e)}'}), 500

@bp.route('/listing/<listing_id>', methods=['GET'])
@token_required
def get_listing_applications(listing_id, current_user):
    """Get all applications for a listing (owner only)"""
    try:
        if not ObjectId.is_valid(listing_id):
            return jsonify({'message': 'Invalid listing ID'}), 400
        
        # Get listing
        listing = get_listings_collection().find_one({'_id': ObjectId(listing_id)})
        
        if not listing:
            return jsonify({'message': 'Listing not found'}), 404
        
        # Check ownership
        if str(listing['owner_id']) != str(current_user['_id']):
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Get applications
        applications_cursor = get_applications_collection().find(
            {'listing_id': ObjectId(listing_id)}
        ).sort('created_at', -1)
        
        applications = []
        for app_data in applications_cursor:
            # Get applicant info
            applicant = get_users_collection().find_one({'_id': app_data['applicant_id']})
            
            application = Application.from_dict(app_data)
            application._id = app_data['_id']
            
            app_dict = application.to_dict()
            if applicant:
                app_dict['applicant'] = {
                    'id': str(applicant['_id']),
                    'username': applicant['username'],
                    'character_name': applicant.get('character_name'),
                    'server': applicant.get('server'),
                    'data_center': applicant.get('data_center')
                }
            
            applications.append(app_dict)
        
        return jsonify({'applications': applications}), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get applications: {str(e)}'}), 500

@bp.route('/<application_id>', methods=['GET'])
@token_required
def get_application(application_id, current_user):
    """Get a single application"""
    try:
        if not ObjectId.is_valid(application_id):
            return jsonify({'message': 'Invalid application ID'}), 400
        
        app_data = get_applications_collection().find_one({'_id': ObjectId(application_id)})
        
        if not app_data:
            return jsonify({'message': 'Application not found'}), 404
        
        # Check if user is applicant or listing owner
        listing = get_listings_collection().find_one({'_id': app_data['listing_id']})
        
        is_applicant = str(app_data['applicant_id']) == str(current_user['_id'])
        is_owner = listing and str(listing['owner_id']) == str(current_user['_id'])
        
        if not (is_applicant or is_owner):
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Get applicant and listing info
        applicant = get_users_collection().find_one({'_id': app_data['applicant_id']})
        
        application = Application.from_dict(app_data)
        application._id = app_data['_id']
        
        app_dict = application.to_dict()
        
        if applicant:
            app_dict['applicant'] = {
                'id': str(applicant['_id']),
                'username': applicant['username'],
                'character_name': applicant.get('character_name'),
                'server': applicant.get('server'),
                'data_center': applicant.get('data_center'),
                'bio': applicant.get('bio')
            }
        
        if listing:
            app_dict['listing'] = {
                'id': str(listing['_id']),
                'title': listing['title'],
                'content_type': listing['content_type'],
                'data_center': listing['data_center']
            }
        
        return jsonify(app_dict), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get application: {str(e)}'}), 500

@bp.route('/<application_id>/status', methods=['PATCH'])
@token_required
def update_application_status(application_id, current_user):
    """Update application status (listing owner only)"""
    try:
        if not ObjectId.is_valid(application_id):
            return jsonify({'message': 'Invalid application ID'}), 400
        
        app_data = get_applications_collection().find_one({'_id': ObjectId(application_id)})
        
        if not app_data:
            return jsonify({'message': 'Application not found'}), 404
        
        # Get listing to check ownership
        listing = get_listings_collection().find_one({'_id': app_data['listing_id']})
        
        if not listing:
            return jsonify({'message': 'Listing not found'}), 404
        
        # Check ownership
        if str(listing['owner_id']) != str(current_user['_id']):
            return jsonify({'message': 'Unauthorized'}), 403
        
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status or new_status not in ['pending', 'accepted', 'rejected']:
            return jsonify({'message': 'Invalid status. Must be pending, accepted, or rejected'}), 400
        
        # Update status
        get_applications_collection().update_one(
            {'_id': ObjectId(application_id)},
            {'$set': {'status': new_status, 'updated_at': datetime.utcnow()}}
        )
        
        # Get updated application
        updated_app_data = get_applications_collection().find_one({'_id': ObjectId(application_id)})
        application = Application.from_dict(updated_app_data)
        application._id = updated_app_data['_id']
        
        return jsonify(application.to_dict()), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to update application status: {str(e)}'}), 500

@bp.route('/<application_id>', methods=['DELETE'])
@token_required
def delete_application(application_id, current_user):
    """Withdraw/delete an application (applicant only)"""
    try:
        if not ObjectId.is_valid(application_id):
            return jsonify({'message': 'Invalid application ID'}), 400
        
        app_data = get_applications_collection().find_one({'_id': ObjectId(application_id)})
        
        if not app_data:
            return jsonify({'message': 'Application not found'}), 404
        
        # Check if user is the applicant
        if str(app_data['applicant_id']) != str(current_user['_id']):
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Delete application
        get_applications_collection().delete_one({'_id': ObjectId(application_id)})
        
        # Decrement listing application count
        get_listings_collection().update_one(
            {'_id': app_data['listing_id']},
            {'$inc': {'application_count': -1}}
        )
        
        return jsonify({'message': 'Application withdrawn successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to delete application: {str(e)}'}), 500