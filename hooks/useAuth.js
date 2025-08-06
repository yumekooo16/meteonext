'use client';
import { useContext } from 'react';
import { UserContext } from '@/context/userContext';

export const useAuth = () => {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un UserProvider');
  }
  
  return context;
}; 