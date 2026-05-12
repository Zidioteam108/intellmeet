import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Preloader from './components/Preloader'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import MeetingsPage from './pages/MeetingsPage'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import VideoRoomPage from './pages/VideoRoomPage'
import PostMeetingPage from './pages/PostMeetingPage'

import KanbanPage from './pages/KanbanPage'
import AnalyticsPage from './pages/AnalyticsPage'

import useAuthInit from './hooks/useAuthInit';
import { useAuthStore } from './store/authStore';

function App() {
  const location = useLocation()
  useAuthInit();
  const { isLoading: isAuthLoading } = useAuthStore();
  const [isPreloading, setIsPreloading] = useState(true)

  useEffect(() => {
    // Show preloader on initial load and when navigating to specified public routes
    const publicRoutes = ['/', '/login', '/signup']
    
    if (publicRoutes.includes(location.pathname)) {
      setIsPreloading(true)
      const timer = setTimeout(() => {
        setIsPreloading(false)
      }, 1500) // 1.5s as requested
      return () => clearTimeout(timer)
    } else {
      // For dashboard and other internal pages, don't show the full-screen preloader
      // unless it's the very first mount (handled by initial state true -> false)
      const initialTimer = setTimeout(() => setIsPreloading(false), 500)
      return () => clearTimeout(initialTimer)
    }
  }, [location.pathname])

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center animate-pulse">
          <div className="text-4xl mb-3">🛰️</div>
          <p className="text-slate-500 font-medium text-sm">Initializing IntellMeet...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Preloader isLoading={isPreloading} />
      
      <div className={`transition-all duration-1000 ${isPreloading ? 'opacity-0 translate-y-4 scale-95 blur-sm' : 'opacity-100 translate-y-0 scale-100 blur-0'}`}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes — wrapped in DashboardLayout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout><DashboardPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout><ProfilePage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/meetings" element={
            <ProtectedRoute>
              <DashboardLayout><MeetingsPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute>
              <DashboardLayout><KanbanPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <DashboardLayout><AnalyticsPage /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/room/:roomId" element={
            <ProtectedRoute>
              <VideoRoomPage />
            </ProtectedRoute>
          } />
          <Route path="/meeting/:meetingId/summary" element={
            <ProtectedRoute>
              <DashboardLayout><PostMeetingPage /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  )
}

export default App