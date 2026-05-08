# Day 4 Meeting API

## Base URL
`http://localhost:5000/api/meetings`

## Authentication
All routes are protected and require a valid JWT token in the header.
**Header:** `Authorization: Bearer <access_token>`

---

## Endpoints

### 1. Create a New Meeting
- **URL:** `/`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "title": "Project Sync",
    "description": "Weekly sync to discuss progress",
    "scheduledFor": "2026-05-10T14:00:00Z"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "meeting": {
      "id": "60d...",
      "title": "Project Sync",
      "roomId": "abc-123-xyz",
      "status": "scheduled",
      "host": "user_id_here"
    }
  }
  ```

### 2. Fetch All Meetings
- **URL:** `/`
- **Method:** `GET`
- **Description:** Returns all meetings where the current user is the host.

### 3. Fetch One Meeting
- **URL:** `/:id`
- **Method:** `GET`

### 4. Update Meeting
- **URL:** `/:id`
- **Method:** `PUT`
- **Body:**
  ```json
  {
    "title": "Updated Title",
    "status": "active"
  }
  ```

### 5. Delete Meeting
- **URL:** `/:id`
- **Method:** `DELETE`

---

## Common Error Messages
- `401 Unauthorized`: Token is missing or invalid.
- `404 Not Found`: Meeting with the specified ID does not exist.
- `400 Bad Request`: Validation error (e.g., missing title).
