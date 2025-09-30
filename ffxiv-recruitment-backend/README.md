# FFXIV Recruitment Platform - Backend API

Flask-based REST API for the FFXIV Recruitment Platform.

## Features

- User authentication with JWT
- MongoDB database integration
- RESTful API endpoints
- CORS support for frontend integration
- External API integrations (FFLogs, XIVAPI)

## Prerequisites

- Python 3.8+
- MongoDB (local or remote)
- pip (Python package manager)

## Installation

1. **Clone the repository and navigate to backend directory**
```bash
cd ffxiv-recruitment-backend
```

2. **Create and activate virtual environment**
```bash
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and update the values:
- `SECRET_KEY`: Generate a random secret key
- `JWT_SECRET_KEY`: Generate another random secret key
- `MONGO_URI`: Your MongoDB connection string

5. **Ensure MongoDB is running**
```bash
# If using local MongoDB:
mongod

# Or use MongoDB Atlas (cloud)
```

## Running the Application

```bash
python run.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users` - Get users (coming soon)

### Listings
- `GET /api/listings` - Get listings (coming soon)

### Applications
- `GET /api/applications` - Get applications (coming soon)

### Messages
- `GET /api/messages` - Get messages (coming soon)

### Search
- `GET /api/search/players` - Search players (coming soon)
- `GET /api/search/listings` - Search listings (coming soon)

## Testing the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

## Project Structure

```
app/
├── __init__.py          # App factory
├── config.py            # Configuration
├── models/              # Data models
├── routes/              # API endpoints
├── services/            # External API integrations
├── middleware/          # Authentication middleware
└── utils/               # Helper functions
```

## Development

To add new routes:
1. Create a new file in `app/routes/`
2. Define your blueprint
3. Register it in `app/__init__.py`

## Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check your `MONGO_URI` in `.env`

**Import Errors:**
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again

**CORS Errors:**
- Verify `CORS_ORIGINS` in `.env` matches your frontend URL

## License

Educational project for coursework.