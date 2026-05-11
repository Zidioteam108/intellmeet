# 🤖 IntellMeet

### AI-Powered Enterprise Meeting & Collaboration Platform

<p align="center">
<img src="https://img.shields.io/badge/MERN-FullStack-green?style=for-the-badge" />
<img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/Node.js-Backend-success?style=for-the-badge" />
<img src="https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge" />
<img src="https://img.shields.io/badge/Framer_Motion-Animated-purple?style=for-the-badge" />
<img src="https://img.shields.io/badge/OpenAI-AI-red?style=for-the-badge" />
</p>

---

## 🚀 Features
- **Real-time video meetings**: Low-latency communication via WebRTC.
- **AI meeting summaries**: Automated minutes and transcription (OpenAI Whisper).
- **In-meeting chat**: Persistent and real-time messaging using Socket.io.
- **Team task management**: Convert discussions into actionable items.
- **Analytics dashboard**: Premium data visualization for productivity.

## 🏗️ Tech Stack
| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion |
| **Backend** | Node.js, Express, MongoDB Atlas, Redis |
| **Real-Time** | Socket.io, WebRTC (Peer-to-Peer) |
| **AI** | OpenAI API (Whisper, GPT-4o-mini) |
| **DevOps** | Docker, Docker Compose, GitHub Actions |

---

## ⚙️ Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/Zidioteam108/intellmeet.git
cd intellmeet
```

### 2. Run with Docker (Recommended)
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

### 3. Local Development
**Backend:**
```bash
cd Backend
npm install
npm run dev
```
**Frontend:**
```bash
cd frontend
npm install
npm run dev
```



## 📊 Week 1 Progress (Checkpoint Complete ✅)
- **Infrastructure**: All backend APIs complete (Auth, Profile, Meetings, Chat).
- **Security**: JWT rotation, Redis caching, and input validation implemented.
- **Real-Time**: Socket.io signaling server and chat persistence fully operational.
- **Frontend**: Premium UI shell, animated dashboard, and meeting lobby complete.
- **Verification**: WebRTC signaling verified in multi-tab browser tests.

## 📊 Week 2 Progress
- [x] Day 8 — Auth connected to frontend, refresh token API, Socket.io auth
- [x] Day 9 — Token persistence, meetings API connected, auth socket tested

---

## 📈 Future Roadmap
- **Week 2**: Full Video Room integration, Auth Store connection, and Screen Sharing.
- **AI Features**: Voice commands and multi-language live translation.
- **Integrations**: Google Calendar and Microsoft Outlook sync.

---

Built by **Zidio Development** ❤️
