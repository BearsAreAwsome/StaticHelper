import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-this')
    
    # MongoDB - Flask-PyMongo requires this format
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/ffxiv_recruitment')
    MONGO_DBNAME = 'ffxiv_recruitment'
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-this')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 24)))
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    # External APIs
    FFLOGS_CLIENT_ID = os.getenv('FFLOGS_CLIENT_ID')
    FFLOGS_CLIENT_SECRET = os.getenv('FFLOGS_CLIENT_SECRET')
    XIVAPI_KEY = os.getenv('XIVAPI_KEY')
    
    # URLs
    API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5000')
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    MONGO_URI = 'mongodb://localhost:27017/ffxiv_recruitment_test'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}