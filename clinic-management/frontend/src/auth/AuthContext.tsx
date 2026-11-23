import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse, Role } from '../types';
import { clearToken, setToken } from '../api/client';
import {
  login as loginApi, registerClinic, patientLogin as patientLoginApi,
  patientRegister as patientRegisterApi,
} from '../api/endpoints';
import type { PatientRegisterBody, RegisterClinicBody } from '../api/endpoints';

interface AuthState {
  user: AuthResponse | null;
  login: (username: string, password: string, remember?: boolean) => Promise<AuthResponse>;
  register: (body: RegisterClinicBody) => Promise<AuthResponse>;
  patientLogin: (mobileNumber: string, password: string) => Promise<AuthResponse>;
  patientRegister: (body: PatientRegisterBody) => Promise<AuthResponse>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);
const USER_KEY = 'clinic_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(USER_KEY) ?? localStorage.getItem(USER_KEY);
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const login = async (username: string, password: string, remember = true) => {
    const res = await loginApi(username, password);
    setToken(res.token, remember);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    (remember ? localStorage : sessionStorage).setItem(USER_KEY, JSON.stringify(res));
    setUser(res);
    return res;
  };

  const register = async (body: RegisterClinicBody) => {
    const res = await registerClinic(body);
    setToken(res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res));
    setUser(res);
    return res;
  };

  const patientLogin = async (mobileNumber: string, password: string) => {
    const res = await patientLoginApi(mobileNumber, password);
    setToken(res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res));
    setUser(res);
    return res;
  };

  const patientRegister = async (body: PatientRegisterBody) => {
    const res = await patientRegisterApi(body);
    setToken(res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res));
    setUser(res);
    return res;
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const hasRole = (...roles: Role[]) => !!user && roles.includes(user.role);

  const value = useMemo(
    () => ({ user, login, register, patientLogin, patientRegister, logout, hasRole }),
    [user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
