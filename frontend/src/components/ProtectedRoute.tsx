import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: Props) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  // Wait for auth initialization to complete before deciding to redirect
  if (isLoading) {
    return null; // The global Preloader in App.tsx will be shown during this time
  }

  // If not logged in, redirect to login page with returnUrl
  if (!isAuthenticated) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
