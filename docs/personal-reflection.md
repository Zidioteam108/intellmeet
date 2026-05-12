# Personal Reflection — IntellMeet Project

## What I Built

Over 15 days, I contributed to building **IntellMeet**, a full-stack AI-powered enterprise meeting platform. My responsibilities spanned the complete stack:

- **Backend**: Built the Express.js API with JWT authentication (access + refresh tokens), MongoDB data models, RESTful CRUD endpoints for meetings and tasks, input validation with express-validator, rate limiting, and a comprehensive global error handler.
- **Frontend**: Implemented the React/TypeScript UI including the Dashboard, Meetings page, Kanban board, Analytics dashboard, Video Room, Post-Meeting summary page, and real-time notification system.
- **AI Integration**: Connected OpenAI Whisper for audio transcription and GPT-4o-mini for meeting summary generation and action item extraction.
- **Real-time**: Set up Socket.io for chat, typing indicators, participant tracking, and notification delivery. Implemented WebRTC for peer-to-peer video calling with screen sharing support.

---

## Key Learnings

1. **WebRTC is hard, but rewarding.** Establishing peer-to-peer video connections requires careful handling of ICE candidates, SDP offer/answer exchange, and track swapping for screen share. Understanding the signaling flow was the biggest learning curve.

2. **AI APIs need defensive programming.** OpenAI responses can be slow, fail, or return unexpected formats. Wrapping every AI call in try/catch with fallback responses and timeout handling is essential for production reliability.

3. **Socket.io room management matters.** Managing personal rooms (`user:userId`) for notifications vs. meeting rooms (`roomId`) for video/chat required careful architectural separation to avoid event leakage.

4. **CSS `transform` breaks `position: fixed`.** A subtle but critical lesson — any parent element with a CSS transform creates a new stacking context, making `fixed` elements relative to that parent instead of the viewport. This caused the mobile navigation bar bug.

5. **TypeScript strictness saves time.** While `verbatimModuleSyntax` and strict type checking caused build errors initially, they caught real bugs that would have surfaced in production.

---

## Challenges and How I Solved Them

### Challenge 1: Mobile Navigation Bar Disappearing
The bottom navigation bar on mobile would scroll away with the content instead of staying fixed at the screen edge. After investigation, I discovered the root cause was a CSS `translate` and `scale` transform on the parent wrapper in `App.tsx`. Removing those transforms and switching to `opacity`-only transitions resolved it immediately.

### Challenge 2: Git Branch Sync Issues
Multiple team members pushing to different branches (main, dev, feature/*) caused merge conflicts during deployment. The fix was establishing a clear workflow: all development on `dev`, merge to `main` only for deployment, and using `git rebase` to keep history clean.

### Challenge 3: Vercel Build Failures
Strict TypeScript settings (`verbatimModuleSyntax`) caused type-only imports to fail during the Vercel build. I learned to separate type imports (`import type { X }`) from value imports to satisfy the compiler.

---

## What I Would Do Differently

1. **Set up CI/CD from Day 1** — A GitHub Actions pipeline running `npm run build` on every push would have caught TypeScript errors before they reached production.

2. **Use code splitting** — The final bundle is over 1MB. Dynamic `import()` for heavy pages like Analytics (Recharts) and Kanban (@hello-pangea/dnd) would significantly improve initial load time.

3. **Add comprehensive unit tests** — While we performed manual E2E testing, automated tests with Vitest for frontend and Jest for backend would have prevented regressions.

4. **Implement proper video recording** — Currently, AI transcription requires manual audio upload. A MediaRecorder integration that automatically captures and sends audio chunks would make the AI pipeline fully automated.

---

## Industry Best Practices Applied

- **JWT with Refresh Token Rotation** — Access tokens expire in 15 minutes; refresh tokens rotate on each use to prevent token theft.
- **Input Validation** — All API endpoints validate incoming data with express-validator before processing.
- **Rate Limiting** — Auth routes limited to 10 requests per 15-minute window to block brute-force attacks.
- **Event-Driven Architecture** — Socket.io handles all real-time communication with namespaced events.
- **WebRTC Peer-to-Peer** — Video/audio streams travel directly between browsers, never touching the server.
- **AI API Integration with Error Handling** — OpenAI calls wrapped in try/catch with structured JSON response parsing.
- **Responsive Mobile-First Design** — Every component tested at 375px (iPhone SE) and up.
- **Environment Variable Management** — All secrets loaded from `.env`, never committed to version control.
