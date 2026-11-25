import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setAuthToken } from '../api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

const readSavedUser = () => {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('userEmail');
  if (!token || !email) return null;
  return { email, name: localStorage.getItem('userName') || '' };
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(readSavedUser);

  // Set the header synchronously so the first requests already carry it.
  setAuthToken(token);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
  }, []);

  const login = (newToken, email, name) => {
    setAuthToken(newToken);
    setToken(newToken);
    setUser({ email, name });
    localStorage.setItem('token', newToken);
    localStorage.setItem('userEmail', email);
    if (name) localStorage.setItem('userName', name);
  };

  // Log out automatically whenever the backend says the session is no longer valid.
  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401 && api.defaults.headers.common.Authorization) {
          logout();
        }
        return Promise.reject(err);
      },
    );
    return () => api.interceptors.response.eject(id);
  }, [logout]);

  // Check a saved token is still valid when the app loads.
  useEffect(() => {
    if (!token) return;
    api.get('/api/auth/me')
      .then((res) => setUser({ email: res.data.email, name: res.data.name }))
      .catch(() => {}); // a 401 is handled by the interceptor; network errors keep the saved user
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
