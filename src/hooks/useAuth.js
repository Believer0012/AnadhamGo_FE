'use client';

import { useState, useEffect, useCallback } from 'react';
import { safeJsonParse } from '../lib/utils';

const STORAGE_KEY = 'aanandham_camper_profile';

function sanitizeCamperProfile(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    name: String(raw.name || 'Camper').slice(0, 80),
    email: String(raw.email || '').slice(0, 100),
    phone: String(raw.phone || '').slice(0, 20),
    level: String(raw.level || 'beginner').slice(0, 30),
    role: 'camper', // Strictly immutable client-side role; server never trusts client storage for privileges
    loggedIn: Boolean(raw.loggedIn)
  };
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage / sessionStorage on mount
  const refreshUser = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      const parsed = safeJsonParse(stored, null);
      setUser(sanitizeCamperProfile(parsed));
    } catch (e) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    // Listen for storage events across tabs or windows
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        refreshUser();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refreshUser]);

  // Login handler
  const login = useCallback((userData, rememberMe = true) => {
    try {
      const json = JSON.stringify(userData);
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY, json);
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(STORAGE_KEY, json);
        localStorage.removeItem(STORAGE_KEY);
      }
      setUser(userData);
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed to save auth session:', e);
    }
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      setUser(null);
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed to clear auth session:', e);
    }
  }, []);

  // Update user profile data
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...(prev || {}), ...updates };
      try {
        const json = JSON.stringify(updated);
        if (localStorage.getItem(STORAGE_KEY)) {
          localStorage.setItem(STORAGE_KEY, json);
        } else {
          sessionStorage.setItem(STORAGE_KEY, json);
        }
        window.dispatchEvent(new Event('storage'));
      } catch (e) {}
      return updated;
    });
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    updateUser,
    refreshUser
  };
}
