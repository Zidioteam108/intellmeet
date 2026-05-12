# IntellMeet — Project Report

## AI-Powered Enterprise Meeting Collaboration Platform

**Submitted by:** Zidio Team 108  
**Date:** May 2026  
**Program:** Zidio Development Internship  

---

## 1. Project Overview

### Problem Statement
Modern enterprise teams waste an average of 4+ hours per week on post-meeting follow-ups — writing summaries, tracking action items, and aligning on next steps. Existing tools treat video calling and task management as separate products, forcing teams to context-switch between multiple platforms.

### Solution
**IntellMeet** is an all-in-one, AI-powered meeting collaboration platform that combines:
- Real-time video meetings (WebRTC)
- AI-powered transcription (OpenAI Whisper)
- Automatic meeting summaries and action item extraction (GPT-4o-mini)
- Kanban task management with drag-and-drop
- Real-time chat with typing indicators
- Live analytics dashboard

### Target Users
- Remote and hybrid enterprise teams
- Project managers tracking meeting outcomes
- Startups needing a lightweight Zoom + Notion alternative

### Business Value
- Reduces post-meeting follow-up time by **~40%**
- Eliminates manual note-taking during meetings
- Provides data-driven insights on meeting patterns
- Centralizes communication, tasks, and analytics in one platform

---

## 2. Features

| ID | Feature | Description | Acceptance Criteria |
|---|---|---|---|
| F-01 | Authentication | JWT login/signup with refresh tokens | Token issued on login, refresh rotates |
| F-02 | Video Meetings | WebRTC peer-to-peer video calls | 2+ users see each other in real-time |
| F-03 | Screen Sharing | One-click screen share in video room | Shared screen visible to all participants |
| F-04 | AI Transcription | OpenAI Whisper speech-to-text | Audio converted to text within seconds |
| F-05 | AI Summary | GPT-4o-mini meeting analysis | Summary auto-generated when host leaves |
| F-06 | Action Items | AI-extracted actionable tasks | Structured list with toggle-complete UI |
| F-07 | Real-time Chat | Socket.io in-meeting chat | Messages appear in under 200ms |
| F-08 | Typing Indicators | Live "user is typing..." display | Indicator shows/hides with debounce |
| F-09 | Kanban Board | Drag-and-drop task management | Cards move between 4 status columns |
| F-10 | Analytics | Recharts data visualization | Bar chart (meetings/day), Pie chart (status) |
| F-11 | Notifications | Socket.io push notifications | Bell icon with unread badge |
| F-12 | Rate Limiting | Brute-force protection | Auth routes blocked after 10 attempts |
| F-13 | Input Validation | express-validator on all endpoints | Proper 422 errors with field-level messages |

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19, TypeScript | UI framework |
| Styling | Tailwind CSS | Utility-first CSS |
| Bundler | Vite | Fast development builds |
| State | Zustand | Lightweight global state |
| Backend | Node.js, Express.js | REST API server |
| Database | MongoDB Atlas + Mongoose | Document database |
| Cache | Redis (Upstash) | Session caching |
| Real-time | Socket.io | Event-driven communication |
| Video | WebRTC | Peer-to-peer media |
| AI | OpenAI Whisper | Speech-to-text |
| AI | GPT-4o-mini | Text analysis |
| Charts | Recharts | Data visualization |
| DnD | @hello-pangea/dnd | Drag-and-drop |
| Validation | express-validator | Input sanitization |
| Auth | JWT + bcrypt | Secure authentication |
| Deployment | Render (backend), Vercel (frontend) | Cloud hosting |

---

## 4. Architecture

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                  │
│  React 19 + TypeScript + Tailwind CSS + Vite         │
│                                                      │
│  Pages: Dashboard, Meetings, Video Room, Tasks,      │
│         Analytics, Post-Meeting, Profile, Auth       │
│                                                      │
│  State: Zustand    API: Axios    RT: Socket.io-client│
└──────────────┬──────────────────┬────────────────────┘
               │ REST API         │ WebSocket
               │ (HTTPS)          │ (WSS)
               ▼                  ▼
┌──────────────────────────────────────────────────────┐
│                   BACKEND (Render)                    │
│  Node.js + Express.js                                │
│                                                      │
│  Auth ──► JWT + bcrypt + refresh tokens               │
│  API  ──► Meetings, Tasks, Transcription, Summary    │
│  RT   ──► Socket.io (chat, typing, notifications)    │
│  AI   ──► OpenAI Whisper + GPT-4o-mini               │
└──────┬──────────┬──────────┬─────────────────────────┘
       │          │          │
       ▼          ▼          ▼
   MongoDB     Redis      OpenAI
   (Atlas)    (Upstash)    (API)
```

**WebRTC Flow:**
```
Browser A ◄──── Socket.io Signaling ────► Browser B
    │                                         │
    └────── Direct P2P Media Stream ──────────┘
```

---

## 5. Security Measures

| Measure | Implementation |
|---|---|
| Password Hashing | bcrypt with 12 salt rounds |
| Authentication | JWT access tokens (15min expiry) |
| Token Rotation | HTTP-only refresh tokens rotated on each use |
| Rate Limiting | 10 requests / 15 minutes on auth routes |
| Input Validation | express-validator on all POST endpoints |
| CORS | Allowlist — only frontend URL and localhost |
| XSS Protection | HTTP-only cookies, no token in localStorage for refresh |
| Environment Secrets | All keys loaded from .env, excluded from git |
| Helmet.js | Security headers set on all responses |

---

## 6. Development Timeline

| Day | Focus | Key Deliverables |
|---|---|---|
| 1–3 | Foundation | Backend setup, MongoDB, auth API, profile system |
| 4–5 | Infrastructure | Redis caching, rate limiting, linting/formatting |
| 6–7 | Frontend | React app, Tailwind setup, dashboard layout, responsive nav |
| 8–9 | Integration | Frontend ↔ Backend connection, auth flow, protected routes |
| 10 | Video | WebRTC peer-to-peer video, Socket.io signaling |
| 11 | AI + UX | Whisper transcription, screen sharing, typing indicators |
| 12 | AI Brain | GPT-4o-mini summary, action items, post-meeting dashboard |
| 13 | Collaboration | Kanban board, notifications, Recharts analytics |
| 14 | Quality | Input validation, error handling, E2E testing, mobile audit |
| 15 | Shipping | Production deploy, README, demo video, report, submission |

---

## 7. Testing Results

### End-to-End Test (Day 14)

| Feature | Result |
|---|---|
| Signup / Login | ✅ Pass |
| Create Meeting | ✅ Pass |
| Join Video Room (2 browsers) | ✅ Pass |
| Real-time Chat | ✅ Pass |
| Typing Indicator | ✅ Pass |
| Screen Sharing | ✅ Pass |
| AI Summary Generation | ✅ Pass |
| Kanban Drag-and-Drop | ✅ Pass |
| Analytics Charts | ✅ Pass |
| Mobile Responsive (375px) | ✅ Pass |
| Rate Limiting | ✅ Pass |
| Input Validation | ✅ Pass |

### Lighthouse Scores

| Category | Score |
|---|---|
| Performance | ~74 |
| Accessibility | ~85 |
| Best Practices | 92 |
| SEO | ~83 |

---

## 8. Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://intellmeet.vercel.app |
| Backend | Render | https://intellmeet-backend.onrender.com |
| Database | MongoDB Atlas | Cloud-hosted cluster |
| Cache | Upstash Redis | Serverless Redis |
| Repository | GitHub | github.com/Zidioteam108/intellmeet |

### Demo Credentials
- **Email:** demo@intellmeet.com
- **Password:** Demo1234!

---

## 9. Future Improvements

1. **Automated Recording + Transcription** — Use MediaRecorder API to capture meeting audio automatically and stream to Whisper in real-time.
2. **Code Splitting** — Dynamic imports for heavy modules (Recharts, @hello-pangea/dnd) to reduce initial bundle size below 500KB.
3. **Automated Testing** — Vitest for frontend components, Jest + Supertest for backend API endpoints.
4. **Multi-party Video** — Upgrade from 1:1 WebRTC to SFU (Selective Forwarding Unit) for meetings with 5+ participants.
5. **Calendar Integration** — Google Calendar / Outlook sync for scheduled meetings.

---

## 10. Team Contributions

| Member | Role | Key Contributions |
|---|---|---|
| Member 1 | Backend Developer | Auth system, API endpoints, AI integration, input validation, error handling |
| Member 2 | Frontend Developer | Dashboard, Meetings, responsive UI, glassmorphism design system |
| Member 3 | AI + WebRTC Developer | Video calling, screen share, transcription, chat, notifications |
| Member 4 | DevOps + Documentation | Deployment, analytics, README, testing, PDF report |

---

*This report documents the complete development lifecycle of IntellMeet, from initial architecture to production deployment, over a 15-day intensive development sprint.*
