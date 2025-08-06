'use client';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/context/userContext';

export default function PremiumFeatures({ children, feature, fallback = null }) {
  const { user } = useContext(UserContext);
  const router = useRouter();

  // Si l'utilisateur est premium, afficher le contenu
  if (user.premium) {
    return children;
  }

  // Si un fallback est fourni, l'afficher
  if (fallback) {
    return fallback;
  }

  // Fallback par défaut pour les fonctionnalités premium
  return (
    <div style={{
      background: 'linear-gradient(135deg, #e0f7fa 0%, #f7fbff 100%)',
      borderRadius: 16,
      padding: 24,
      textAlign: 'center',
      border: '2px dashed #1fc8db',
      margin: '20px 0'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#000' }}>
        Fonctionnalité Premium
      </h3>
      <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '1rem' }}>
        Cette fonctionnalité est réservée aux utilisateurs Premium.
      </p>
      
      <div style={{ 
        background: '#fff', 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: '1.5rem',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{ fontWeight: 600, color: '#1fc8db', marginBottom: 8 }}>
          ✨ Débloquez avec Premium :
        </div>
        <div style={{ color: '#666', fontSize: '0.9rem' }}>
          • Prévisions météo sur 5 jours<br/>
          • Accès aux villes favorites<br/>
          • Données météo avancées<br/>
          • Alertes météo personnalisées
        </div>
      </div>

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
          cursor: 'pointer',
          boxShadow: '0 2px 8px 0 rgba(31,200,219,0.3)',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 4px 16px 0 rgba(31,200,219,0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 2px 8px 0 rgba(31,200,219,0.3)';
        }}
      >
        Passer à Premium
      </button>
    </div>
  );
}

// Composant pour afficher un indicateur premium
export function PremiumBadge({ children, showBadge = true }) {
  const { user } = useContext(UserContext);

  return (
    <div style={{ position: 'relative' }}>
      {children}
      {user.premium && showBadge && (
        <div style={{
          position: 'absolute',
          top: -8,
          right: -8,
          background: '#4caf50',
          color: '#fff',
          borderRadius: '50%',
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(76,175,80,0.3)'
        }}>
          ✨
        </div>
      )}
    </div>
  );
} 