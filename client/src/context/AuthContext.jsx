import { createContext, useContext, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('skillhub_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('skillhub_token');
    const storedUser = localStorage.getItem('skillhub_user');

    // No saved session.
    if (!token || !storedUser) {
      setLoading(false);
      return;
    }

    // Keep the locally saved session immediately.
    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem('skillhub_user');
    }

    // Online: validate and refresh the session from the server.
    // Offline: keep the locally saved session.
    if (!navigator.onLine) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem('skillhub_user', JSON.stringify(data.user));
      })
      .catch((err) => {
        // Network failure should NOT log the student out.
        if (!err.response) {
          return;
        }

        // A real 401 means the server rejected the token.
        if (err.response.status === 401) {
          localStorage.removeItem('skillhub_token');
          localStorage.removeItem('skillhub_user');
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (token, userData) => {
    localStorage.setItem('skillhub_token', token);
    localStorage.setItem('skillhub_user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (payload) => {
    if (!navigator.onLine) {
      return {
        success: false,
        message: 'Registration requires an internet connection.'
      };
    }

    try {
      const { data } = await api.post('/auth/register', payload);
      persistSession(data.token, data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  };

  const login = async (payload) => {
    if (!navigator.onLine) {
      return {
        success: false,
        message: 'Please connect to the internet for your first login. After logging in once, SkillHub can be used offline.'
      };
    }

    try {
      const { data } = await api.post('/auth/login', payload);
      persistSession(data.token, data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  };

  const logout = () => {
    localStorage.removeItem('skillhub_token');
    localStorage.removeItem('skillhub_user');
    setUser(null);
  };

  const updateUserLocal = (userData) => {
    setUser(userData);
    localStorage.setItem('skillhub_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateUserLocal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);