# Flask API Backend Structure

```
ffxiv-recruitment-backend/
├── app/
│   ├── __init__.py              # Flask app factory
│   ├── config.py                # Configuration settings
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py              # User model
│   │   ├── listing.py           # Recruitment listing model
│   │   ├── application.py       # Application model
│   │   └── message.py           # Message model
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py              # Authentication routes
│   │   ├── users.py             # User profile routes
│   │   ├── listings.py          # Listing CRUD routes
│   │   ├── applications.py      # Application routes
│   │   ├── messages.py          # Messaging routes
│   │   └── search.py            # Search routes
│   ├── services/
│   │   ├── __init__.py
│   │   ├── fflogs_service.py    # FFLogs API integration
│   │   ├── xivapi_service.py    # XIVAPI integration
│   │   └── email_service.py     # Gmail API integration
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth_middleware.py   # JWT authentication
│   └── utils/
│       ├── __init__.py
│       ├── validators.py        # Input validation
│       └── helpers.py           # Helper functions
├── migrations/                   # Database migrations (if using Flask-Migrate)
├── tests/
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_listings.py
│   └── test_applications.py
├── .env                         # Environment variables
├── .env.example                 # Example environment variables
├── .gitignore
├── requirements.txt             # Python dependencies
├── run.py                       # Application entry point
└── README.md
```

## Key Components

### Models
- **User**: Authentication, profile data, FFLogs/Lodestone IDs
- **Listing**: Recruitment posts with state pattern (private, recruiting, filled)
- **Application**: Player applications to listings
- **Message**: Direct messaging between users

### Routes (API Endpoints)
- **/api/auth**: Login, register, token refresh
- **/api/users**: Profile management
- **/api/listings**: CRUD operations for recruitment posts
- **/api/applications**: Apply to listings, manage applications
- **/api/messages**: Send and receive messages
- **/api/search**: Search players and listings

### Services
- **FFLogs**: Fetch player progression data
- **XIVAPI**: Fetch character data from Lodestone
- **Email**: Send notifications via Gmail API

### Middleware
- **JWT Authentication**: Protect routes, validate tokens