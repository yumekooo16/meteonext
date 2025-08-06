import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setIsPremium(false);
      setIsLoading(false);
      return;
    }

    checkPremiumStatus();
  }, [user]);

  const checkPremiumStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/check-premium-status');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la vérification du statut premium');
      }

      const data = await response.json();
      setIsPremium(data.isPremium);
    } catch (err) {
      console.error('Erreur vérification premium:', err);
      setError(err.message);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPremiumStatus = () => {
    checkPremiumStatus();
  };

  return {
    isPremium,
    isLoading,
    error,
    refreshPremiumStatus
  };
} 