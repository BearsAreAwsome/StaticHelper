# Listings API Documentation

## Overview

The Listings API manages recruitment listings for FFXIV static groups. It implements the State Pattern with three states: `private`, `recruiting`, and `filled`.

## State Pattern

### States

1. **Private** - Listing is not visible to other users
   - Can edit: ✅
   - Can apply: ❌

2. **Recruiting** - Listing is actively recruiting
   - Can edit: ✅
   - Can apply: ✅

3. **Filled** - Listing is filled and closed
   - Can edit: ❌
   - Can apply: ❌

## Endpoints

### 1. Get All Listings

```
GET /api/listings
```

**Query Parameters:**
- `data_center` (optional) - Filter by data center (Aether, Crystal, Primal, Dynamis)
- `content_type` (optional) - Filter by content type (savage, ultimate, extreme, etc.)
- `server` (optional) - Filter by server
- `state` (optional) - Filter by state (requires authentication)
- `page` (optional) - Page number (default: 1)
- `per_page` (optional) - Items per page (default: 20)

**Response:**
```json
{
  "listings": [...],
  "total": 42,
  "page": 1,
  "per_page": 20,
  "pages": 3
}
```

**Example:**
```bash
curl http://localhost:5000/api/listings?data_center=Aether&page=1
```

---

### 2. Get Single Listing

```
GET /api/listings/:id
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "M4S Static LF Tank & Healer",
  "description": "Looking for experienced players...",
  "owner_id": "507f1f77bcf86cd799439012",
  "owner": {
    "id": "507f1f77bcf86cd799439012",
    "username": "recruiter1",
    "character_name": "Cloud Strife",
    "server": "Gilgamesh"
  },
  "content_type": "savage",
  "content_name": "Anabaseios Savage",
  "data_center": "Aether",
  "server": "Gilgamesh",
  "roles_needed": {
    "tank": 1,
    "healer": 1
  },
  "schedule": ["Tuesday 8PM EST", "Thursday 8PM EST"],
  "requirements": {
    "min_ilvl": 630,
    "experience": "Previous savage experience"
  },
  "voice_chat": "Discord",
  "additional_info": "Friendly group",
  "state": "recruiting",
  "can_apply": true,
  "can_edit": true,
  "application_count": 5,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00",
  "is_owner": false
}
```

**Example:**
```bash
curl http://localhost:5000/api/listings/507f1f77bcf86cd799439011
```

---

### 3. Create Listing

```
POST /api/listings
```

**Authentication:** Required

**Request Body:**
```json
{
  "title": "M4S Static LF Tank & Healer",
  "description": "Looking for experienced Tank and Healer",
  "content_type": "savage",
  "content_name": "Anabaseios Savage",
  "data_center": "Aether",
  "server": "Gilgamesh",
  "roles_needed": {
    "tank": 1,
    "healer": 1
  },
  "schedule": ["Tuesday 8PM EST", "Thursday 8PM EST"],
  "requirements": {
    "min_ilvl": 630,
    "experience": "Previous savage experience required"
  },
  "voice_chat": "Discord",
  "additional_info": "LGBTQ+ friendly",
  "state": "private"
}
```

**Required Fields:**
- `title`
- `description`
- `content_type`
- `data_center`

**Response:** 201 Created
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "M4S Static LF Tank & Healer",
  ...
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/listings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "M4S Static LF Tank",
    "description": "Need tank for week 1",
    "content_type": "savage",
    "data_center": "Aether"
  }'
```

---

### 4. Update Listing

```
PUT /api/listings/:id
```

**Authentication:** Required (must be owner)

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "roles_needed": {
    "tank": 2,
    "healer": 1
  },
  "schedule": ["Monday 7PM EST"]
}
```

**Note:** Cannot edit listings in `filled` state

**Response:** 200 OK

**Example:**
```bash
curl -X PUT http://localhost:5000/api/listings/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

---

### 5. Delete Listing

```
DELETE /api/listings/:id
```

**Authentication:** Required (must be owner)

**Response:** 200 OK
```json
{
  "message": "Listing deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:5000/api/listings/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 6. Change Listing State

```
PATCH /api/listings/:id/state
```

**Authentication:** Required (must be owner)

**Request Body:**
```json
{
  "state": "recruiting"
}
```

**Valid States:**
- `private`
- `recruiting`
- `filled`

**Response:** 200 OK

**Example:**
```bash
curl -X PATCH http://localhost:5000/api/listings/507f1f77bcf86cd799439011/state \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"state": "recruiting"}'
```

---

### 7. Get My Listings

```
GET /api/listings/my-listings
```

**Authentication:** Required

**Response:**
```json
{
  "listings": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "M4S Static",
      "state": "recruiting",
      ...
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:5000/api/listings/my-listings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Data Models

### Listing Object

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| title | string | Listing title |
| description | string | Detailed description |
| owner_id | string | User ID of owner |
| content_type | string | Type of content (savage, ultimate, etc.) |
| content_name | string | Specific content name |
| data_center | string | Data center (Aether, Crystal, Primal, Dynamis) |
| server | string | Specific server |
| roles_needed | object | Roles needed with counts |
| schedule | array | Raid schedule |
| requirements | object | Requirements for applicants |
| voice_chat | string | Voice chat platform |
| additional_info | string | Additional information |
| state | string | Listing state (private/recruiting/filled) |
| can_apply | boolean | Whether users can apply |
| can_edit | boolean | Whether listing can be edited |
| application_count | number | Number of applications |
| created_at | string | ISO 8601 timestamp |
| updated_at | string | ISO 8601 timestamp |

### Content Types

- `savage` - Savage raids
- `ultimate` - Ultimate raids
- `extreme` - Extreme trials
- `chaotic` - Chaotic raids
- `criterion` - Criterion dungeons
- `alliance_raid` - Alliance raids
- `normal_raid` - Normal raids
- `dungeon` - Dungeons

### Data Centers

- `Aether`
- `Crystal`
- `Primal`
- `Dynamis`

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "title is required"
}
```

### 401 Unauthorized
```json
{
  "message": "Token is missing"
}
```

### 403 Forbidden
```json
{
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "message": "Listing not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Failed to create listing: <error details>"
}
```

---

## Testing

Run the test script:
```bash
python test_listings.py
```

This will test all endpoints and the state pattern implementation.

---

## Notes

- Private listings are only visible to their owners
- Recruiting and filled listings are visible to all users
- Only owners can edit or delete their listings
- Listings in `filled` state cannot be edited (state pattern enforcement)
- All timestamps are in ISO 8601 format (UTC)