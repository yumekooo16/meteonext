'use client';
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/context/userContext';

export default function AuthGuard({ children, requireAuth = true, redirectTo = '/form' }) {
  const { user } = useContext(UserContext);
  const router = useRouter();

  // Gérer les redirections avec useEffect
  useEffect(() => {
    if (!user.loading) {
      // Si l'authentification est requise et l'utilisateur n'est pas connecté
      if (requireAuth && !user.connecté) {
        router.push(redirectTo);
      }
      // Si l'utilisateur est connecté et qu'on est sur une page publique (comme /form)
      else if (!requireAuth && user.connecté) {
        router.push('/ma-ville');
      }
    }
  }, [user, requireAuth, redirectTo, router]);

  // Afficher un loader pendant le chargement initial
  if (user.loading) {
    return (
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
    return null;
  }

  // Si l'utilisateur est connecté et qu'on est sur une page publique (comme /form)
  if (!requireAuth && user.connecté) {
    return null;
  }

  // Afficher le contenu si tout est OK
  return children;
} 