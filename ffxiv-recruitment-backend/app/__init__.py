import os
from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from app.config import config

# Initialize MongoDB client
mongo_client = None
db = None

def create_app(config_name=None):
    """Application factory pattern"""
    global mongo_client, db
    
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    app.url_map.strict_slashes = False
    
    # Simple CORS configuration for development
    CORS(app, origins=["http://localhost:3000", "https://static-helper.vercel.app/"])
    
    # Initialize MongoDB
    mongo_client = MongoClient(app.config['MONGO_URI'])
    db = mongo_client.get_database("ffxiv_recruitment")
    
    # Store in app context for easy access
    app.mongo_client = mongo_client
    app.db = db
    
    print(f"✅ Connected to MongoDB: {db.name}")
    
    # Register blueprints
    from app.routes import auth, users, listings, applications, messages, search
    
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(users.bp, url_prefix='/api/users')
    app.register_blueprint(listings.bp, url_prefix='/api/listings')
    app.register_blueprint(applications.bp, url_prefix='/api/applications')
    app.register_blueprint(messages.bp, url_prefix='/api/messages')
    app.register_blueprint(search.bp, url_prefix='/api/search')
    
    # Health check endpoint
    @app.route('/health')
    def health():
        try:
            # Check MongoDB connection
            app.db.command('ping')
            return {'status': 'healthy', 'database': 'connected'}, 200
        except Exception as e:
            return {'status': 'unhealthy', 'database': 'disconnected', 'error': str(e)}, 503
    
    @app.route('/')
    def index():
        return {'message': 'FFXIV Recruitment API', 'version': '1.0.0'}, 200
    
    return app

def get_db():
    """Get database instance"""
    from flask import current_app
    return current_app.db