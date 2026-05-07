import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'

// Placeholder pages for routes that will be built on upcoming days
const MeetingsPage = () => (
  <div><h1 className="text-2xl font-bold">Meetings</h1><p className="text-gray-500 mt-2">Coming on Day 4–5</p></div>
)
const TasksPage = () => (
  <div><h1 className="text-2xl font-bold">Tasks</h1><p className="text-gray-500 mt-2">Coming on Day 10–11</p></div>
)
const AnalyticsPage = () => (
  <div><h1 className="text-2xl font-bold">Analytics</h1><p className="text-gray-500 mt-2">Coming on Day 13</p></div>
)

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" />} />
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
    </Routes>
  )
}

export default App