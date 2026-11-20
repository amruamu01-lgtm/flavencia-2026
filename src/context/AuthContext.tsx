import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminSession, getSession, saveSession, clearSession, sha256 } from '../services/auth';
import { callBackendApi, loadLocalDb, saveLocalDb } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  adminUsername: string;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AdminSession | null>(() => getSession());
  const [loading, setLoading] = useState<boolean>(false);

  // Auto-check session expiration periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const current = getSession();
      if (!current && session) {
        setSession(null);
      }
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [session]);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const cleanUser = username.trim();
      const cleanPass = password;

      if (!cleanUser || !cleanPass) {
        setLoading(false);
        return { success: false, error: 'Please enter both username and password.' };
      }

      const inputHash = await sha256(cleanPass);
      const db = loadLocalDb();
      
      const userSetting = db.settings.find(s => s.settingKey === 'adminUsername');
      const passSetting = db.settings.find(s => s.settingKey === 'adminPasswordHash');

      const expectedUser = userSetting ? userSetting.settingValue : 'admin';
      // Default fallback hash for 'admin123' or 'flavencia2026'
      // If none set, 'flavencia2026' hash: 3e042bce5c9bc052df3a94f6f7eb35a74e539959e1c28c89d2d0c242c7e0b6ea
      // Or 'admin123' hash: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
      const expectedHash = passSetting ? passSetting.settingValue : '3e042bce5c9bc052df3a94f6f7eb35a74e539959e1c28c89d2d0c242c7e0b6ea';

      const isValidUser = cleanUser.toLowerCase() === expectedUser.toLowerCase();
      // Allow 'flavencia2026' or 'admin123' out-of-the-box
      const isInitialPass = cleanPass === 'flavencia2026' || cleanPass === 'admin123';
      const isHashMatch = inputHash === expectedHash;

      if (isValidUser && (isHashMatch || isInitialPass)) {
        const newSession = saveSession(cleanUser);
        setSession(newSession);
        setLoading(false);
        return { success: true };
      }

      setLoading(false);
      return { success: false, error: 'Invalid username or password.' };
    } catch (e: any) {
      setLoading(false);
      return { success: false, error: e.message || 'Authentication error.' };
    }
  };

  const logout = () => {
    clearSession();
    setSession(null);
  };

  const changePassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!newPass || newPass.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    try {
      const oldHash = await sha256(oldPass);
      const newHash = await sha256(newPass);
      const db = loadLocalDb();
      
      const passSetting = db.settings.find(s => s.settingKey === 'adminPasswordHash');
      const currentStoredHash = passSetting ? passSetting.settingValue : '3e042bce5c9bc052df3a94f6f7eb35a74e539959e1c28c89d2d0c242c7e0b6ea';

      const isOldMatch = oldHash === currentStoredHash || oldPass === 'flavencia2026' || oldPass === 'admin123';
      if (!isOldMatch) {
        return { success: false, error: 'Current password is incorrect.' };
      }

      // Update password hash
      const now = new Date().toISOString();
      if (passSetting) {
        passSetting.settingValue = newHash;
        passSetting.updatedAt = now;
      } else {
        db.settings.push({
          settingKey: 'adminPasswordHash',
          settingValue: newHash,
          updatedAt: now
        });
      }

      saveLocalDb(db);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update password.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!session,
        adminUsername: session?.username || 'admin',
        login,
        logout,
        changePassword,
        loading
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
