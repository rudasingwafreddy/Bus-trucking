import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types';
import { storage } from '../lib/storage';

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  loginAsDemoRole: (role: UserRole) => void;
  register: (email: string, fullName: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Profile>) => void;
}

const DEMO_PROFILES: Record<UserRole, Profile> = {
  passenger: {
    id: 'user-passenger-01',
    email: 'passenger@rwandabus.rw',
    full_name: 'Aline Uwase',
    phone_number: '+250 788 123 456',
    role: 'passenger',
    language_preference: 'en',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  driver: {
    id: 'user-driver-jean',
    email: 'driver.kbs@rwandabus.rw',
    full_name: 'Jean Claude Mugisha',
    phone_number: '+250 788 555 101',
    role: 'driver',
    language_preference: 'en',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  operator: {
    id: 'user-operator-kbs',
    email: 'dispatch@kbs.rw',
    full_name: 'Patrick Ndayisaba (KBS Fleet)',
    phone_number: '+250 788 100 100',
    role: 'operator',
    language_preference: 'en',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  admin: {
    id: 'user-admin-main',
    email: 'admin@rwandabus.rw',
    full_name: 'Super Admin (Rwanda Transport Oversight)',
    phone_number: '+250 788 000 000',
    role: 'admin',
    language_preference: 'en',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(() => {
    try {
      const saved = localStorage.getItem('rwandabus_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(user);
  const role: UserRole = user?.role || 'passenger';

  const login = async (email: string, preferredRole: UserRole = 'passenger') => {
    // Check if demo profile matches
    const matched = Object.values(DEMO_PROFILES).find(p => p.email.toLowerCase() === email.toLowerCase());
    const profile = matched || {
      id: 'user-' + Date.now(),
      email,
      full_name: email.split('@')[0],
      role: preferredRole,
      language_preference: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setUser(profile);
    localStorage.setItem('rwandabus_user', JSON.stringify(profile));
    storage.addAuditLog({
      user_id: profile.id,
      user_email: profile.email,
      action: 'USER_LOGIN',
      resource_type: 'AUTH',
      details: { role: profile.role }
    });
  };

  const loginAsDemoRole = (targetRole: UserRole) => {
    const profile = DEMO_PROFILES[targetRole];
    setUser(profile);
    localStorage.setItem('rwandabus_user', JSON.stringify(profile));
    storage.addAuditLog({
      user_id: profile.id,
      user_email: profile.email,
      action: 'DEMO_LOGIN_SWITCH',
      resource_type: 'AUTH',
      details: { role: targetRole }
    });
  };

  const register = async (email: string, fullName: string, targetRole: UserRole) => {
    const profile: Profile = {
      id: 'user-' + Date.now(),
      email,
      full_name: fullName,
      role: targetRole,
      language_preference: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setUser(profile);
    localStorage.setItem('rwandabus_user', JSON.stringify(profile));
    storage.addAuditLog({
      user_id: profile.id,
      user_email: profile.email,
      action: 'USER_REGISTERED',
      resource_type: 'AUTH',
      details: { role: targetRole, full_name: fullName }
    });
  };

  const logout = () => {
    if (user) {
      storage.addAuditLog({
        user_id: user.id,
        user_email: user.email,
        action: 'USER_LOGOUT',
        resource_type: 'AUTH'
      });
    }
    setUser(null);
    localStorage.removeItem('rwandabus_user');
  };

  const updateProfile = (updates: Partial<Profile>) => {
    if (!user) return;
    const updated = { ...user, ...updates, updated_at: new Date().toISOString() };
    setUser(updated);
    localStorage.setItem('rwandabus_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        loginAsDemoRole,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
