# IntellMeet Demo Video Script

## Duration Target: 5–6 minutes

---

### 🎬 0:00 – 0:30 — Introduction

> "Hi, I'm [Your Name] and this is **IntellMeet** — an AI-powered enterprise meeting collaboration platform. It's built with the MERN stack and integrates real-time video calling, AI-powered transcription using OpenAI Whisper, automatic meeting summaries with GPT-4o-mini, a Kanban task board, and live analytics. Let me walk you through the entire platform."

**[Show: Landing page with logo]**

---

### 🔐 0:30 – 1:30 — Authentication & Dashboard

1. Click "Login" on the landing page
2. Enter demo credentials: `demo@intellmeet.com` / `Demo1234!`
3. Show the login form validation (try submitting empty, show error messages)
4. Login successfully → redirected to Dashboard

> "We use JWT authentication with refresh token rotation and HTTP-only cookies. Rate limiting prevents brute-force attacks — only 10 attempts per 15 minutes."

**[Show: Dashboard with stats cards, AI Workspace section, quick actions]**

---

### 📹 1:30 – 2:30 — Create & Join a Meeting

1. Click "NEW MEETING" button in the top navbar
2. Navigate to Meetings page
3. Fill in title: "Q3 Strategy Review"
4. Click "Create Room"
5. Click "Enter Room" on the new meeting card
6. Camera permission dialog appears → Allow
7. Show your live video feed

> "WebRTC handles all peer-to-peer video. No media passes through our server — it's encrypted end-to-end."

**[Show: Video room with camera feed, top bar with room info]**

---

### 💬 2:30 – 3:30 — Real-time Features

1. Click the chat toggle button (💬)
2. Type a message in the chat panel
3. Show it appearing instantly
4. Point out the participant list at the bottom
5. Click mute/unmute to show the toggle
6. Click the screen share button (if on desktop)

> "Socket.io powers all real-time communication — chat, typing indicators, participant list, and signaling for WebRTC connections."

---

### 🤖 3:30 – 4:30 — AI Features (Post-Meeting)

1. Click "Leave" to exit the meeting room
2. Show automatic redirection to the Post-Meeting Summary page
3. Click "Generate AI Report"
4. Wait for the AI summary to appear
5. Show the structured summary paragraph
6. Show the extracted action items list
7. Toggle one action item as complete

> "When the host leaves, GPT-4o-mini analyzes all recorded transcriptions and generates a structured summary with actionable items. This saves teams hours of manual note-taking."

---

### ✅ 4:30 – 5:15 — Task Board & Analytics

1. Navigate to "Tasks" in the sidebar
2. Show the Kanban board with 4 columns
3. Create a new task: "Follow up on Q3 targets"
4. Drag a task card from "To Do" to "In Progress"
5. Navigate to "Analytics" in the sidebar
6. Show the Meetings Per Day bar chart
7. Show the Meeting Status Breakdown pie chart
8. Point out the live metrics cards at the top

> "The Kanban board uses @hello-pangea/dnd for smooth drag-and-drop, and the analytics dashboard is powered by Recharts with real data from our API."

---

### 📱 5:15 – 5:45 — Mobile Responsiveness

1. Open Chrome DevTools (F12)
2. Toggle device toolbar → iPhone view (375px)
3. Show the mobile bottom navigation bar
4. Navigate between Dashboard, Meetings, Tasks
5. Show that everything adapts perfectly

> "Every page is fully responsive. The bottom navigation bar stays fixed on mobile, and all components adapt to small screens."

---

### 🏁 5:45 – 6:00 — Closing

> "IntellMeet is deployed live — the backend runs on Render and the frontend on Vercel. The complete source code is available on GitHub with comprehensive documentation. Thank you for watching."

**[Show: GitHub repo page with README visible]**

---

## Recording Tips
- Use a clean browser profile (no bookmarks bar clutter)
- Close unnecessary tabs
- Speak clearly and at a steady pace
- Keep mouse movements smooth and deliberate
- Use Loom, OBS, or Win+G (Xbox Game Bar) to record
- Upload to YouTube (Unlisted) or Loom for sharing
