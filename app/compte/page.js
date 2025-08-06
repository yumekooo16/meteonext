'use client';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/context/userContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { loadStripe } from '@stripe/stripe-js';
import AuthGuard from '@/components/AuthGuard';
import Footer from '@/components/footer';

// Créer le stripePromise en dehors du composant pour éviter la recréation à chaque rendu
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Compte() {
  const { user, signOut, deleteAccount } = useContext(UserContext);
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user.connecté) router.push('/form');
  }, [user, router]);

  if (!user.connecté) return null;

  const handleClick = async () => {
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [
            {
              price_data: {
                currency: 'eur',
                product_data: {
                  name: 'Prévision météo 5 jours',
                },
                unit_amount: 499, // 4.99€
              },
              quantity: 1,
            },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la création de la session de paiement');
      }

      const data = await res.json();
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe n\'a pas pu être initialisé');
      }

      // Rediriger directement vers l'URL de la session Stripe
      window.location.href = data.url;
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors du processus de paiement');
    }
  };


  return (
    <AuthGuard requireAuth={true} redirectTo="/form">
      <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <button
        onClick={() => router.back()}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 2,
          background: 'rgba(31,200,219,0.12)',
          color: '#1fc8db',
          border: 'none',
          borderRadius: 8,
          padding: '8px 18px',
          fontWeight: 500,
          fontSize: 16,
          cursor: 'pointer',
          boxShadow: '0 2px 8px 0 rgba(31,200,219,0.07)'
        }}
      >
        ← Retour
      </button>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 420, margin: '40px auto', background: '#fff', borderRadius: 24, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.04)', padding: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: 8, color: '#000' }}>Mon compte</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ color: '#000' }}><b>Nom d'utilisateur :</b> {user.nom || 'Utilisateur'}</div>
          <div style={{ color: '#000' }}><b>Email :</b> {user.email || '...'}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button style={{ background: '#1fc8db', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }} onClick={() => router.push('/compte/modifier')}>Modifier mes infos</button>
            <button style={{ background: '#ff6f61', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }} onClick={() => setShowConfirm(true)}>Supprimer mon compte</button>
          </div>
          {showConfirm && (
            <div style={{ marginTop: 8, background: '#fff3f3', border: '1px solid #ff6f61', borderRadius: 8, padding: 16 }}>
              <div style={{ marginBottom: 8, color: '#000' }}>
                ⚠️ <strong>Attention !</strong> Cette action est irréversible.<br/>
                Toutes vos données (favoris, préférences) seront définitivement supprimées.
              </div>
              <div style={{ marginBottom: 12, fontSize: '0.9rem', color: '#666' }}>
                Êtes-vous sûr de vouloir supprimer votre compte ?
              </div>
              <button 
                style={{ 
                  background: deleting ? '#ccc' : '#ff6f61', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '8px 16px', 
                  marginRight: 8, 
                  fontWeight: 500, 
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.7 : 1
                }} 
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    const result = await deleteAccount();
                    if (result.success) {
                      alert('✅ Compte supprimé avec succès !');
                      router.push('/form');
                    } else {
                      alert('❌ Erreur: ' + result.error);
                      setDeleting(false);
                    }
                  } catch (error) {
                    alert('❌ Erreur lors de la suppression: ' + error.message);
                    setDeleting(false);
                  }
                }}
              >
                {deleting ? '⏳ Suppression...' : '🗑️ Oui, supprimer définitivement'}
              </button>
              <button 
                style={{ 
                  background: '#eee', 
                  color: '#222', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '8px 16px', 
                  fontWeight: 500, 
                  cursor: 'pointer' 
                }} 
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
              >
                Annuler
              </button>
            </div>
          )}
        </div>
        {/* Section amélioration compte */}
        {user.premium ? (
          <div style={{ background: 'linear-gradient(135deg, #e8f5e8 0%, #f0fff0 100%)', borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px 0 rgba(76,175,80,0.07)', border: '2px solid #4caf50' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/Weather.svg" alt="Prévision 5 jours" style={{ width: 36, height: 36 }} />
              <span style={{ background: '#4caf50', color: '#fff', borderRadius: 12, padding: '4px 12px', fontWeight: 600, fontSize: 14, letterSpacing: 1 }}>PREMIUM ACTIF</span>
            </div>
            <div style={{ fontWeight: 500, fontSize: 18, margin: '8px 0 4px 0', color: '#000' }}>🎉 Félicitations !</div>
            <div style={{ color: '#000', fontSize: 15, textAlign: 'center', marginBottom: 8 }}>Votre compte est maintenant Premium !</div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 16, width: '100%', marginTop: 8 }}>
              <div style={{ fontWeight: 600, color: '#4caf50', marginBottom: 8 }}>✨ Fonctionnalités débloquées :</div>
              <div style={{ color: '#666', fontSize: 14 }}>
                • Prévisions météo sur 5 jours<br/>
                • Accès aux villes favorites<br/>
                • Données météo avancées<br/>
                • Alertes météo personnalisées
              </div>
            </div>
            <button 
              style={{ 
                background: 'linear-gradient(90deg, #4caf50 0%, #45a049 100%)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 8, 
                padding: '10px 28px', 
                fontWeight: 600, 
                fontSize: 16, 
                cursor: 'pointer', 
                marginTop: 8
              }} 
              onClick={() => router.push('/ma-ville')}
            >
              Voir ma météo
            </button>
          </div>
        ) : (
          <div style={{ background: 'linear-gradient(135deg, #e0f7fa 0%, #f7fbff 100%)', borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px 0 rgba(31,200,219,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/Weather.svg" alt="Prévision 5 jours" style={{ width: 36, height: 36 }} />
              <span style={{ background: '#1fc8db', color: '#fff', borderRadius: 12, padding: '4px 12px', fontWeight: 600, fontSize: 14, letterSpacing: 1 }}>PREMIUM</span>
            </div>
            <div style={{ fontWeight: 500, fontSize: 18, margin: '8px 0 4px 0', color: '#000' }}>Envie d'aller plus loin ?</div>
            <div style={{ color: '#000', fontSize: 15, textAlign: 'center', marginBottom: 8 }}>Améliore ton compte pour débloquer la prévision météo sur 5 jours pour tes villes favorites !</div>
            <button style={{ background: 'linear-gradient(90deg, #1fc8db 0%, #00bfae 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px 0 rgba(31,200,219,0.07)' }} onClick={handleClick}>Améliorer mon compte</button>
          </div>
        )}
      </div>
    </div>
        
    </AuthGuard>
  );
}
