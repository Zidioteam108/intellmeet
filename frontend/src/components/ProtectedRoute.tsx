import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: Props) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  // If not logged in, redirect to login page with returnUrl
  if (!isAuthenticated) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
