'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import Galaxy from '@/components/galaxy';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Success() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('Aucun ID de session trouvé');
      setLoading(false);
      return;
    }

    // Vérifier le statut de la session
    const checkSession = async () => {
      try {
        const response = await fetch('/api/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la vérification de la session');
        }

        const sessionData = await response.json();
        setSession(sessionData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [searchParams]);

  if (loading) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
        <Galaxy style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <div style={{ fontSize: '1.2rem' }}>Vérification du paiement...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
        <Galaxy style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center', color: '#fff', maxWidth: 500, padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Erreur</h1>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>{error}</p>
            <button 
              onClick={() => router.push('/compte')}
              style={{
                background: 'linear-gradient(90deg, #1fc8db 0%, #00bfae 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer'
              }}
            >
              Retour au compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (session?.status === 'complete') {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
        <Galaxy style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div style={{ 
            background: '#fff', 
            borderRadius: 24, 
            padding: 48, 
            maxWidth: 500, 
            textAlign: 'center',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: '1rem', color: '#000' }}>
              Paiement réussi !
            </h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#666' }}>
              Félicitations ! Votre compte a été mis à niveau vers Premium.
            </p>
            <div style={{ 
              background: 'linear-gradient(135deg, #e0f7fa 0%, #f7fbff 100%)', 
              borderRadius: 16, 
              padding: 24, 
              marginBottom: '2rem',
              border: '2px solid #1fc8db'
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1fc8db', marginBottom: '0.5rem' }}>
                ✨ Nouvelles fonctionnalités débloquées
              </div>
              <div style={{ color: '#666' }}>
                • Prévisions météo sur 5 jours<br/>
                • Accès aux villes favorites<br/>
                • Données météo avancées
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button 
                onClick={() => router.push('/ma-ville')}
                style={{
                  background: 'linear-gradient(90deg, #1fc8db 0%, #00bfae 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 24px',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer'
                }}
              >
                Voir ma météo
              </button>
              <button 
                onClick={() => router.push('/compte')}
                style={{
                  background: 'transparent',
                  color: '#1fc8db',
                  border: '2px solid #1fc8db',
                  borderRadius: 8,
                  padding: '12px 24px',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer'
                }}
              >
                Mon compte
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <Galaxy style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Paiement en cours...</h1>
          <p style={{ fontSize: '1.1rem' }}>Veuillez patienter pendant que nous finalisons votre transaction.</p>
        </div>
      </div>
    </div>
  );
}