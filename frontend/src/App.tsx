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

// Placeholder pages for routes that will be built on upcoming days
const TasksPage = () => (
  <div className="p-8"><h1 className="text-3xl font-black text-slate-900 mb-4">Tasks</h1><p className="text-slate-500 font-medium">This module is coming soon in the next phase of development.</p></div>
)
const AnalyticsPage = () => (
  <div className="p-8"><h1 className="text-3xl font-black text-slate-900 mb-4">Analytics</h1><p className="text-slate-500 font-medium">This module is coming soon in the next phase of development.</p></div>
)

function App() {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Show preloader on initial load and when navigating to specified public routes
    const publicRoutes = ['/', '/login', '/signup']
    
    if (publicRoutes.includes(location.pathname)) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1500) // 1.5s as requested
      return () => clearTimeout(timer)
    } else {
      // For dashboard and other internal pages, don't show the full-screen preloader
      // unless it's the very first mount (handled by initial state true -> false)
      const initialTimer = setTimeout(() => setIsLoading(false), 500)
      return () => clearTimeout(initialTimer)
    }
  }, [location.pathname])

  return (
    <>
      <Preloader isLoading={isLoading} />
      
      <div className={`transition-all duration-1000 ${isLoading ? 'opacity-0 translate-y-4 scale-95 blur-sm' : 'opacity-100 translate-y-0 scale-100 blur-0'}`}>
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
              <DashboardLayout><TasksPage /></DashboardLayout>
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  )
}

export default App