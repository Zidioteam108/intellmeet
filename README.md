# IntellMeet — AI-Powered Enterprise Meeting Collaboration Platform

![IntellMeet Banner](frontend/src/assets/logo.png)

## 📌 Overview

IntellMeet is a full-stack, AI-powered enterprise meeting platform built for real-time collaboration. It enables teams to conduct video meetings, automatically transcribe conversations using OpenAI Whisper, generate intelligent summaries with GPT-4o-mini, manage tasks on a Kanban board, and track productivity through a live analytics dashboard — all in one platform.

---

## ✨ Features

- 🎥 **Real-time Video Meetings** — WebRTC-powered peer-to-peer video calls
- 🤖 **AI Transcription** — Automatic speech-to-text using OpenAI Whisper
- 📝 **AI Meeting Summary** — GPT-4o-mini generates structured summaries and action items
- 💬 **Live Team Chat** — Socket.io real-time messaging with typing indicators
- 🖥️ **Screen Sharing** — One-click screen share within any meeting room
- 👥 **Live Participant List** — Real-time roster synced via Socket.io
- ✅ **Kanban Task Board** — Drag-and-drop task management (To Do → In Progress → Review → Done)
- 🔔 **Real-time Notifications** — Socket.io push notifications with unread badge
- 📊 **Analytics Dashboard** — Live charts showing meetings per day and status breakdown (Recharts)
- 🔐 **Secure Auth** — JWT access tokens + HTTP-only refresh tokens + bcrypt password hashing
- 🛡️ **Input Validation** — express-validator on all endpoints
- 🚦 **Rate Limiting** — Brute-force protection on auth routes

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, Vite |
| State Management | Zustand |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Real-time | Socket.io, WebRTC |
| AI | OpenAI Whisper, GPT-4o-mini |
| Cache | Redis (Upstash/ioredis) |
| Charts | Recharts |
| Drag & Drop | @hello-pangea/dnd |
| Validation | express-validator |
| Deployment | Render (Backend), Vercel (Frontend) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas account
- OpenAI API key
- Redis instance (Upstash recommended for free tier)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Zidioteam108/intellmeet.git
cd intellmeet

# 2. Setup Backend
cd Backend
npm install
cp .env.example .env   # Fill in your values
npm run dev

# 3. Setup Frontend (new terminal)
cd frontend
npm install
# Create frontend/.env with:
# VITE_API_URL=http://localhost:5000
npm run dev
```

### Environment Variables

**Backend `.env`:**
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_secret
OPENAI_API_KEY=sk-...
REDIS_URL=rediss://...
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:5000
```

---

## 📁 Project Structure

```
intellmeet/
├── Backend/
│   ├── src/
│   │   ├── config/         # DB, Redis, OpenAI setup
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes
│   │   └── socket/         # Socket.io handlers
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios API helpers
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks (useWebRTC, etc.)
│   │   ├── pages/          # Route-level page components
│   │   ├── store/          # Zustand global state
│   │   └── utils/          # Socket utility, helpers
│   └── index.html
└── docs/
    └── day14-e2e-test-report.md
```

---

## 🔐 Security

- JWT authentication with refresh token rotation
- HTTP-only cookies for refresh tokens (XSS protection)
- Rate limiting on auth routes (10 requests / 15 minutes)
- Input validation on all POST endpoints using `express-validator`
- Passwords hashed with `bcrypt` (salt rounds: 12)
- CORS allowlist — only frontend URL permitted
- MongoDB URI, JWT secrets, and API keys loaded via environment variables
- `.env` excluded from version control via `.gitignore`

---

## 🌐 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://intellmeet.vercel.app |
| Backend | Render | https://intellmeet-backend.onrender.com |

---

## 👥 Team

| Role | Responsibility |
|---|---|
| Member 1 | Backend — APIs, Auth, AI Integration, Validation |
| Member 2 | Frontend — Dashboard, Meetings, Responsive UI |
| Member 3 | AI + WebRTC — Video, Transcription, Chat, Notifications |
| Member 4 | DevOps — Deployment, Analytics, Documentation, Testing |

---

## 📄 License

This project is built as part of the Zidio Development Internship program.
