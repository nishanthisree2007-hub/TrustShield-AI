import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/client';

interface User { id: number; username: string; email: string; role: string; }
interface AuthCtx { user: User | null; token: string | null; login: (u: string, p: string) => Promise<void>; logout: () => void; loading: boolean; error: string; }

const AuthContext = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ts_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      api.get('/auth/me').then(r => setUser(r.data)).catch(() => { localStorage.removeItem('ts_token'); setToken(null); });
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    setLoading(true); setError('');
    try {
      const form = new URLSearchParams(); form.append('username', username); form.append('password', password);
      const res = await api.post('/auth/token', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      localStorage.setItem('ts_token', res.data.access_token);
      setToken(res.data.access_token); setUser(res.data.user);
    } catch (e: any) { setError(e?.response?.data?.detail || 'Authentication failed'); }
    setLoading(false);
  };

  const logout = () => { localStorage.removeItem('ts_token'); setToken(null); setUser(null); };

  return <AuthContext.Provider value={{ user, token, login, logout, loading, error }}>{children}</AuthContext.Provider>;
};
