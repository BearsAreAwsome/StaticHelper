from datetime import datetime
from bson import ObjectId

class ListingState:
    """Base class for listing states"""
    def can_apply(self):
        return False
    
    def can_edit(self):
        return False
    
    def get_state_name(self):
        return "unknown"

class PrivateState(ListingState):
    """Listing is private - not visible to others"""
    def can_edit(self):
        return True
    
    def get_state_name(self):
        return "private"

class RecruitingState(ListingState):
    """Listing is actively recruiting"""
    def can_apply(self):
        return True
    
    def can_edit(self):
        return True
    
    def get_state_name(self):
        return "recruiting"

class FilledState(ListingState):
    """Listing is filled - no longer accepting applications"""
    def can_edit(self):
        return False
    
    def get_state_name(self):
        return "filled"

# State factory
STATE_MAP = {
    'private': PrivateState(),
    'recruiting': RecruitingState(),
    'filled': FilledState()
}

class Listing:
    """Recruitment listing model with state pattern"""
    
    def __init__(self, title, description, owner_id, **kwargs):
        self.title = title
        self.description = description
        self.owner_id = owner_id
        self.content_type = kwargs.get('content_type')  # savage, ultimate, extreme, etc.
        self.content_name = kwargs.get('content_name')  # e.g., "Anabaseios Savage"
        self.data_center = kwargs.get('data_center')
        self.server = kwargs.get('server')
        self.roles_needed = kwargs.get('roles_needed', {})  # {"tank": 1, "healer": 2, "dps": 1}
        self.schedule = kwargs.get('schedule', [])  # ["Tuesday 8PM EST", "Thursday 8PM EST"]
        self.requirements = kwargs.get('requirements', {})  # {"min_ilvl": 630, "progression": ["P9S", "P10S"]}
        self.voice_chat = kwargs.get('voice_chat')  # Discord, Teamspeak, etc.
        self.additional_info = kwargs.get('additional_info', '')
        self.state = kwargs.get('state', 'private')  # private, recruiting, filled
        self.created_at = kwargs.get('created_at', datetime.utcnow())
        self.updated_at = kwargs.get('updated_at', datetime.utcnow())
        self.application_count = kwargs.get('application_count', 0)
    
    def get_state(self):
        """Get the state object"""
        return STATE_MAP.get(self.state, PrivateState())
    
    def can_apply(self):
        """Check if users can apply to this listing"""
        return self.get_state().can_apply()
    
    def can_edit(self):
        """Check if the listing can be edited"""
        return self.get_state().can_edit()
    
    def change_state(self, new_state):
        """Change the listing state"""
        if new_state in STATE_MAP:
            self.state = new_state
            self.updated_at = datetime.utcnow()
            return True
        return False
    
    def to_dict(self, include_owner_details=False):
        """Convert listing to dictionary"""
        listing_dict = {
            'id': str(self._id) if hasattr(self, '_id') else None,
            'title': self.title,
            'description': self.description,
            'owner_id': str(self.owner_id),
            'content_type': self.content_type,
            'content_name': self.content_name,
            'data_center': self.data_center,
            'server': self.server,
            'roles_needed': self.roles_needed,
            'schedule': self.schedule,
            'requirements': self.requirements,
            'voice_chat': self.voice_chat,
            'additional_info': self.additional_info,
            'state': self.state,
            'can_apply': self.can_apply(),
            'can_edit': self.can_edit(),
            'application_count': self.application_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_owner_details and hasattr(self, 'owner'):
            listing_dict['owner'] = self.owner
        
        return {k: v for k, v in listing_dict.items() if v is not None}
    
    @classmethod
    def from_dict(cls, data):
        """Create Listing instance from dictionary"""
        return cls(**data)