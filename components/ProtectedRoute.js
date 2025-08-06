'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo = '/form',
  fallback = null 
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si l'authentification est requise et l'utilisateur n'est pas connecté
    if (requireAuth && !user.loading && !user.connecté) {
      router.push(redirectTo);
    }
    
    // Si l'utilisateur est connecté et qu'on est sur une page publique
    if (!requireAuth && !user.loading && user.connecté) {
      router.push('/ma-ville');
    }
  }, [user, requireAuth, redirectTo, router]);

  // Afficher le fallback pendant le chargement
  if (user.loading) {
    return fallback || (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ fontSize: '1.2rem' }}>Chargement...</div>
        </div>
      </div>
    );
  }

  // Si l'authentification est requise et l'utilisateur n'est pas connecté
  if (requireAuth && !user.connecté) {
    return null; // Ne rien afficher pendant la redirection
  }

  // Si l'utilisateur est connecté et qu'on est sur une page publique
  if (!requireAuth && user.connecté) {
    return null; // Ne rien afficher pendant la redirection
  }

  // Afficher le contenu si tout est OK
  return children;
} 