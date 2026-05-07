<div align="center">

# 🤖 IntellMeet
### AI-Powered Enterprise Meeting & Collaboration Platform

<p align="center">
Real-Time Video Meetings • AI Summaries • Smart Action Items • Team Collaboration
</p>

<p align="center">
<img src="https://img.shields.io/badge/MERN-FullStack-green?style=for-the-badge" />
<img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/Node.js-Backend-success?style=for-the-badge" />
<img src="https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge" />
<img src="https://img.shields.io/badge/WebRTC-RealTime-orange?style=for-the-badge" />
<img src="https://img.shields.io/badge/OpenAI-AI-red?style=for-the-badge" />
</p>

<p align="center">
Production-grade MERN Full Stack Application with AI Meeting Intelligence, Real-Time Video Collaboration, Smart Task Extraction, and Enterprise Team Management.
</p>

<p align="center">
<a href="#-overview">Overview</a> •
<a href="#-key-features">Features</a> •
<a href="#️-tech-stack">Tech Stack</a> •
<a href="#-installation--setup">Setup</a> •
<a href="#-deployment">Deployment</a>
</p>

</div>

---

# 📌 Overview

**IntellMeet** is a next-generation AI-powered enterprise collaboration platform designed for modern remote and hybrid teams.

The platform combines:

- 🎥 Real-time video conferencing
- 🧠 AI meeting summaries
- 📋 Smart action item extraction
- 💬 Real-time team chat
- 📊 Productivity analytics
- 🗂️ Team & project collaboration

The system is built using the **MERN Stack**, **WebRTC**, **Socket.io**, and **AI integrations** like OpenAI/Hugging Face to provide a scalable and production-ready collaboration ecosystem.

---

# 🚀 Key Features

| Feature | Description |
|----------|-------------|
| 🔐 Secure Authentication | JWT Authentication with refresh tokens & role-based access |
| 🎥 Real-Time Meetings | WebRTC powered HD video conferencing |
| 💬 Live Team Chat | Real-time messaging with Socket.io |
| 🧠 AI Meeting Intelligence | AI-generated summaries, transcription & action items |
| 📋 Smart Task Management | Convert meeting discussions into actionable tasks |
| 📊 Analytics Dashboard | Productivity metrics & engagement insights |
| 🗂️ Team Workspace | Kanban boards & collaborative workspaces |
| ☁️ Cloud Media Storage | Cloudinary/AWS S3 integration |
| 📡 Real-Time Notifications | Instant alerts and updates |
| 🛡️ Enterprise Security | Rate limiting, encrypted sessions, OWASP protections |

---

# 🏗️ System Architecture

```bash
Frontend (React + TypeScript)
        ↓
Backend API (Node.js + Express)
        ↓
MongoDB Database
        ↓
Socket.io + WebRTC
        ↓
AI Services (OpenAI / HuggingFace)
```

---

# 🧠 AI Capabilities

IntellMeet integrates powerful AI features including:

- 🎤 Live Meeting Transcription
- 📝 AI-generated Meeting Summaries
- ✅ Smart Action Item Extraction
- 👤 Assignee Detection
- 📚 Searchable Meeting History

The AI engine significantly reduces manual note-taking and improves productivity across enterprise teams.

---

# ⚙️ Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui
- Zustand
- TanStack Query

## Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.io
- WebRTC
- Redis

## AI & Cloud

- OpenAI API
- Hugging Face
- Cloudinary / AWS S3

## DevOps & Deployment

- Docker
- Kubernetes
- GitHub Actions
- Prometheus
- Grafana
- Sentry

---

# 📂 Project Structure

```bash
IntellMeet/
│
├── frontend/               # Frontend Application (React + Vite)
├── Backend/                # Backend Application (Node.js + Express)
├── README.md
└── ...
```

---

# 🔥 Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Zidioteam108/intellmeet.git
cd intellmeet
```

---

## 2️⃣ Install Dependencies

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd ../Backend
npm install
```

---

# 🛠️ Environment Variables

Create a `.env` file inside the **Backend** folder.

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5174
```

---

# ▶️ Running the Application

## Start Backend

```bash
cd Backend
npm start
```

## Start Frontend

```bash
cd frontend
npm run dev
```

---

# 🌐 Application URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5174 |
| Backend API | http://localhost:5000 |

---

# 💡 Development Note: Mock Auth Mode
If the backend is not yet connected or running, the frontend includes a **Mock Auth Fallback**. You can "Sign In" or "Sign Up" with any credentials to explore the premium Dashboard UI immediately.

---

# 🧪 Production Goals

| Metric | Target |
|--------|---------|
| Concurrent Users | 500–5000 |
| Uptime SLA | 99.95% |
| Latency | < 200ms |
| Concurrent Meetings | 10k+ |
| Security | Enterprise Grade |

---

# 🔐 Security Features

- JWT Authentication
- Refresh Tokens
- Password Hashing with bcrypt
- OWASP Top 10 Protection
- Rate Limiting
- Role-Based Access Control
- Secure Environment Variables
- Optional End-to-End Encryption

---

# 📊 Monitoring & Observability

- 📈 Prometheus Monitoring
- 📉 Grafana Dashboards
- 🐞 Sentry Error Tracking
- 📋 Centralized Logging

---

# 🚀 Deployment

## Docker

```bash
docker-compose up --build
```

## Kubernetes

```bash
kubectl apply -f kubernetes/
```

---

# 📸 Screenshots

> Add your application screenshots here

| Dashboard | Video Meeting | AI Summary |
|-----------|---------------|------------|
| ![img](./screenshots/dashboard.png) | ![img](./screenshots/meeting.png) | ![img](./screenshots/summary.png) |

---

# 🧑‍💻 Development Workflow

```bash
feat: add AI summary generation
fix: resolve socket reconnect issue
refactor: optimize meeting state handling
```

---

# 📈 Future Improvements

- AI Voice Commands
- Multi-language Transcription
- AI Meeting Insights
- Calendar Integrations
- Mobile Application
- Advanced Analytics

---

# 🤝 Contribution

Contributions are welcome!

```bash
Fork → Clone → Create Branch → Commit → Push → Pull Request
```

---

# 📜 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

### Zidio Development – Web Development (MERN)

Built with ❤️ using modern engineering principles.

---

# ⭐ Final Note

IntellMeet is designed as a production-grade enterprise collaboration platform focused on scalability, AI intelligence, security, and modern real-time communication systems.

This project demonstrates:

- Advanced MERN stack development
- Real-time communication systems
- AI integration
- Cloud-native deployment
- Enterprise-grade architecture

---

<div align="center">

### 🌟 If you like this project, don't forget to star the repository 🌟

</div>
