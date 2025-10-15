from datetime import datetime
from bson import ObjectId

class Application:
    """Application model for listing applications"""
    
    def __init__(self, listing_id, applicant_id, **kwargs):
        self.listing_id = listing_id
        self.applicant_id = applicant_id
        self.status = kwargs.get('status', 'pending')  # pending, accepted, rejected
        self.message = kwargs.get('message', '')
        self.availability = kwargs.get('availability', [])
        self.preferred_roles = kwargs.get('preferred_roles', [])
        self.experience = kwargs.get('experience', '')
        self.created_at = kwargs.get('created_at', datetime.utcnow())
        self.updated_at = kwargs.get('updated_at', datetime.utcnow())
    
    def to_dict(self, include_details=False):
        """Convert application to dictionary"""
        app_dict = {
            'id': str(self._id) if hasattr(self, '_id') else None,
            'listing_id': str(self.listing_id),
            'applicant_id': str(self.applicant_id),
            'status': self.status,
            'message': self.message,
            'availability': self.availability,
            'preferred_roles': self.preferred_roles,
            'experience': self.experience,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_details:
            if hasattr(self, 'applicant'):
                app_dict['applicant'] = self.applicant
            if hasattr(self, 'listing'):
                app_dict['listing'] = self.listing
        
        return {k: v for k, v in app_dict.items() if v is not None}
    
    @classmethod
    def from_dict(cls, data):
        """Create Application instance from dictionary"""
        return cls(**data)