from datetime import datetime
from bson import ObjectId
import bcrypt

class User:
    """User model for authentication and profile data"""
    
    def __init__(self, username, email, password_hash, **kwargs):
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.character_name = kwargs.get('character_name')
        self.server = kwargs.get('server')
        self.data_center = kwargs.get('data_center')
        self.lodestone_id = kwargs.get('lodestone_id')
        self.fflogs_id = kwargs.get('fflogs_id')
        self.bio = kwargs.get('bio', '')
        self.availability = kwargs.get('availability', [])
        self.roles = kwargs.get('roles', [])  # Tank, Healer, DPS
        self.progression = kwargs.get('progression', {})
        self.created_at = kwargs.get('created_at', datetime.utcnow())
        self.updated_at = kwargs.get('updated_at', datetime.utcnow())
    
    def to_dict(self, include_sensitive=False):
        """Convert user to dictionary"""
        user_dict = {
            'id': str(self._id) if hasattr(self, '_id') else None,
            'username': self.username,
            'email': self.email if include_sensitive else None,
            'character_name': self.character_name,
            'server': self.server,
            'data_center': self.data_center,
            'lodestone_id': self.lodestone_id,
            'fflogs_id': self.fflogs_id,
            'bio': self.bio,
            'availability': self.availability,
            'roles': self.roles,
            'progression': self.progression,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        return {k: v for k, v in user_dict.items() if v is not None or include_sensitive}
    
    @staticmethod
    def hash_password(password):
        """Hash a password"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    @staticmethod
    def verify_password(password, password_hash):
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    
    @classmethod
    def from_dict(cls, data):
        """Create User instance from dictionary"""
        return cls(**data)