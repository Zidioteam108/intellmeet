import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  bio?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  // Read token from localStorage if it exists
  accessToken: localStorage.getItem('intellmeet_token'),
  isAuthenticated: false,
  isLoading: true, // start as loading so we check token first

  setAuth: (user, token) => {
    // Save token to localStorage so it survives refresh
    localStorage.setItem('intellmeet_token', token);
    set({ user, accessToken: token, isAuthenticated: true, isLoading: false });
  },

  clearAuth: () => {
    // Remove token from localStorage on logout
    localStorage.removeItem('intellmeet_token');
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  setLoading: (loading) => set({ isLoading: loading }),
}));
