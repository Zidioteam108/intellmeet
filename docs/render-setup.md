# Backend Deployment Settings (Render)

These settings should be used when deploying the backend to Render.com.

## Repository Settings
- **Service Type:** Web Service
- **Root Directory:** `Backend`
- **Environment:** `Node`

## Build & Start Commands
- **Build Command:** `npm install`
- **Start Command:** `npm start` (or `node server.js`)

## Environment Variables
Ensure the following are set in the Render Dashboard:
- `PORT`: 5000
- `MONGODB_URI`: [Your MongoDB Connection String]
- `JWT_SECRET`: [Your Secret Key]
- `CLIENT_URL`: [Your Frontend URL]
- `NODE_ENV`: production
