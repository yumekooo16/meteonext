'use client';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/context/userContext';

export default function Navbar() {
  const { user, signOut } = useContext(UserContext);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/form');
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        cursor: 'pointer'
      }} onClick={() => router.push('/')}>
        <img src="/Weather.svg" alt="Logo" style={{ width: 32, height: 32 }} />
        <span style={{ 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          background: 'linear-gradient(90deg, #1fc8db 0%, #00bfae 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          MétéoNext
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user.connecté ? (
          <>
            <span style={{ color: '#666', fontSize: '0.9rem' }}>
              Bonjour, {user.nom} !
              {user.premium && (
                <span style={{
                  background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                  color: '#fff',
                  borderRadius: 12,
                  padding: '4px 14px',
                  marginLeft: 10,
                  fontSize: '1rem',
                  fontWeight: 700,
                  boxShadow: '0 0 8px 2px #43e97b55',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  letterSpacing: '0.04em',
                  animation: 'premiumGlow 1.8s infinite alternate',
                }}>
                  <span style={{ fontSize: '1.2em', marginRight: 4 }}>✨</span> PREMIUM
                  <style>{`@keyframes premiumGlow { from { box-shadow: 0 0 8px 2px #43e97b55; } to { box-shadow: 0 0 18px 6px #38f9d788; } }`}</style>
                </span>
              )}
            </span>
            {!user.premium && (
              <button
                onClick={() => router.push('/premium')}
                style={{
                  background: 'linear-gradient(90deg, #4caf50 0%, #45a049 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: 600
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                💎 Premium
              </button>
            )}
            <button
              onClick={() => router.push('/compte')}
              style={{
                background: 'transparent',
                color: '#1fc8db',
                border: '1px solid #1fc8db',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#1fc8db';
                e.target.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#1fc8db';
              }}
            >
              Mon compte
            </button>
            <button
              onClick={handleLogout}
              style={{
                background: '#ff6f61',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#e55a4f';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#ff6f61';
              }}
            >
              Se déconnecter
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push('/form')}
            style={{
              background: 'linear-gradient(90deg, #1fc8db 0%, #00bfae 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(31, 200, 219, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Se connecter
          </button>
        )}
      </div>
    </nav>
  );
}