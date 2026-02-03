// src/hooks/useSharePoint.ts

import { useState, useEffect } from 'react';
import { sharePointService } from '../services/sharepoint.service';
import { AccountInfo } from '@azure/msal-browser';

export function useSharePoint() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const authenticated = sharePointService.isAuthenticated();
    const currentUser = sharePointService.getCurrentUser();
    
    setIsAuthenticated(authenticated);
    setUser(currentUser);
    setLoading(false);
  };

  const login = async () => {
    try {
      setLoading(true);
      await sharePointService.login();
      checkAuth();
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await sharePointService.logout();
      checkAuth();
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    sharePointService
  };
}
