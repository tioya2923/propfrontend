import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.me()
        .then(res => setUser(res.data.user))
        .catch(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login(email, password);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const isAdmin = user?.permissoes === 'admin';
  const isStaff = user?.permissoes === 'staff' || isAdmin;
  const isSeminarista = user?.permissoes === 'seminarista';
  const isSuperAdmin = isAdmin && !user?.seccao;
  const isProfessor = user?.cargo === 'professor';
  const cargo = user?.cargo ?? null;
  const seccao = user?.seccao ?? null;
  const seccaoLabel = null; // Single seminary — no section split

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isStaff, isSeminarista, isSuperAdmin, isProfessor, cargo, seccao, seccaoLabel }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
