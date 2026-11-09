# React Native Integration Changes

This document summarizes the changes made to support React Native mobile app integration.

## Summary of Changes

### 1. Authentication System
- **Added JWT-based authentication** with `python-jose` and `passlib`
- **New endpoints:**
  - `POST /auth/register` - Register new users
  - `POST /auth/login` - Login and get JWT token
  - `GET /auth/me` - Get current user info (requires authentication)

### 2. File Upload Support
- **New endpoint:** `POST /upload-audio` - Upload audio files directly
- **Updated endpoint:** `POST /stt` - Now accepts both:
  - Multipart file uploads (React Native)
  - JSON with `audio_url` (existing API)
- Files are stored in `uploads/audio/` directory
- Supports: MP3, WAV, M4A, AAC, OGG, FLAC, WEBM
- Max file size: 25MB (configurable via `MAX_AUDIO_FILE_SIZE_MB`)

### 3. Error Handling
- Consistent error response format:
  ```json
  {
    "error": {
      "code": 400,
      "message": "Error message",
      "type": "HTTPException"
    }
  }
  ```
- Global exception handlers for better error consistency

### 4. Pagination
- **New endpoints:**
  - `GET /conversations` - List user conversations (paginated)
  - `GET /conversations/{conversation_id}/messages` - Get messages (paginated)
- Response format:
  ```json
  {
    "items": [...],
    "total": 100,
    "page": 1,
    "page_size": 20,
    "has_next": true,
    "has_prev": false
  }
  ```

### 5. Database Changes
- Added `password_hash` field to `User` model (nullable for backward compatibility)
- Existing users without passwords can still use the API without authentication

### 6. Optional Authentication
- Most endpoints now support **optional authentication**
- Endpoints work with or without JWT tokens:
  - `/chat` - Uses `user_id` from token if authenticated, otherwise from request
  - `/upload-audio` - Associates files with user if authenticated

## Environment Variables

Add these to your `.env` file:

```env
# JWT Configuration
JWT_SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=43200  # 30 days

# File Upload Configuration
UPLOAD_DIR=uploads/audio
MAX_AUDIO_FILE_SIZE_MB=25
BASE_URL=http://localhost:8000  # Change for production
```

## Installation

Install new dependencies:

```bash
pip install -r requirements.txt
```

New dependencies added:
- `python-jose[cryptography]==3.3.0`
- `passlib[bcrypt]==1.7.4`

## Database Migration

If you have existing data, you'll need to add the `password_hash` column:

```sql
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
```

Or use Alembic for migrations (recommended).

## React Native Usage Examples

### Authentication
```javascript
// Register
const response = await fetch('http://your-api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user123',
    password: 'securepassword',
    preferred_language: 'en'
  })
});
const { access_token } = await response.json();

// Store token securely (e.g., React Native Keychain)
// Use in subsequent requests:
headers: {
  'Authorization': `Bearer ${access_token}`
}
```

### File Upload
```javascript
// Using FormData for audio upload
const formData = new FormData();
formData.append('file', {
  uri: audioUri,
  type: 'audio/m4a',
  name: 'recording.m4a'
});

const response = await fetch('http://your-api/upload-audio', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  },
  body: formData
});
```

### STT with File Upload
```javascript
const formData = new FormData();
formData.append('file', {
  uri: audioUri,
  type: 'audio/m4a',
  name: 'recording.m4a'
});

const response = await fetch('http://your-api/stt', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Pagination
```javascript
const response = await fetch(
  'http://your-api/conversations?page=1&page_size=20',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const { items, total, has_next, has_prev } = await response.json();
```

## Backward Compatibility

- **Existing endpoints remain unchanged** in behavior
- Old API calls without authentication still work
- Only new endpoints require authentication (where specified)
- `/chat` endpoint maintains backward compatibility with `user_id` in request body

## Security Notes

1. **Change JWT_SECRET_KEY** in production - use a strong random secret
2. **Use HTTPS** in production - required for mobile apps
3. **Token expiration** - Default is 30 days, adjust as needed
4. **File size limits** - Configure `MAX_AUDIO_FILE_SIZE_MB` appropriately

## API Version

API version updated to `0.2.0` with React Native support.

