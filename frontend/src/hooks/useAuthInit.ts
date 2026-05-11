import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getMyProfile, refreshToken } from '../api/authApi';

const useAuthInit = () => {
  const { accessToken, setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      // If no token saved, definitely not logged in
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        // Try to get profile with saved token
        const data = await getMyProfile(accessToken);
        setAuth(data.user, accessToken);

      } catch (error: any) {
        // If 401 — token expired. Try refresh token.
        if (error?.response?.status === 401) {
          try {
            const refreshData = await refreshToken();
            const newToken = refreshData.accessToken;

            // Get profile with new token
            const profileData = await getMyProfile(newToken);
            setAuth(profileData.user, newToken);

          } catch {
            // Refresh also failed — clear auth
            clearAuth();
          }
        } else {
          clearAuth();
        }
      }
    };

    initAuth();
  }, []); // runs only once on app start
};

export default useAuthInit;
