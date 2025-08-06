'use client';
import React, { useContext } from 'react';
import { UserContext } from '@/context/userContext';
import { useRouter } from 'next/navigation';
import Footer from '@/components/footer';


export default function PremiumPage() {
  const { user } = useContext(UserContext);
  const router = useRouter();

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              price_data: {
                currency: 'eur',
                product_data: {
                  name: 'Premium Météo',
                  description: 'Accès aux prévisions sur 5 jours et fonctionnalités avancées',
                },
                unit_amount: 499, // 4.99€ en centimes
              },
              quantity: 1,
            },
          ],
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        // Méthode 1: Redirection directe (recommandée pour votre cas)
        window.location.href = data.url;
        
        // Méthode 2: Utilisation de redirectToCheckout (alternative)
        // const stripe = await stripePromise;
        // const { error } = await stripe.redirectToCheckout({
        //   sessionId: data.sessionId
        // });
        // if (error) {
        //   console.error('Erreur de redirection:', error);
        // }
      }
    } catch (error) {
      console.error('Erreur lors de la création de la session:', error);
      alert('Erreur lors de la création de la session de paiement: ' + error.message);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      
      {/* Bouton retour */}
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

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '40px auto', padding: '0 20px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 700, 
            marginBottom: 16, 
            color: '#fff',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🌤️ Débloquez la météo sur 5 jours
          </h1>
          <p style={{ 
            fontSize: '1.3rem', 
            color: '#fff', 
            opacity: 0.9,
            maxWidth: 600,
            margin: '0 auto'
          }}>
            Passez en Premium et accédez à des prévisions météo détaillées pour planifier vos activités en toute sérénité
          </p>
        </div>

        {/* Comparatif Gratuit vs Premium */}
        <div style={{ 
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 24,
          padding: 32,
          marginBottom: 32,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 600, 
            marginBottom: 24,
            textAlign: 'center',
            color: '#1fc8db'
          }}>
            Comparatif des fonctionnalités
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr auto auto', 
            gap: 16,
            alignItems: 'center'
          }}>
            {/* En-têtes */}
            <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#333' }}>Fonctionnalité</div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#666', textAlign: 'center' }}>Gratuit</div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#4caf50', textAlign: 'center' }}>Premium</div>
            
            {/* Lignes de fonctionnalités */}
            {[
              { feature: 'Météo actuelle', free: true, premium: true },
              { feature: 'Villes favorites', free: true, premium: true },
              { feature: 'Prévisions sur 5 jours', free: false, premium: true },
              { feature: 'Données météo avancées', free: false, premium: true },
              { feature: 'Support prioritaire', free: false, premium: true },
              { feature: 'Limite de favoris', free: '3 villes', premium: '50 villes' }
            ].map((item, index) => (
              <React.Fragment key={index}>
                <div style={{ 
                  padding: '12px 0', 
                  borderBottom: '1px solid #eee',
                  fontWeight: 500,
                  color: '#333'
                }}>
                  {item.feature}
                </div>
                <div style={{ 
                  padding: '12px 0', 
                  borderBottom: '1px solid #eee',
                  textAlign: 'center',
                  color: item.free === true ? '#4caf50' : item.free === false ? '#f44336' : '#666'
                }}>
                  {item.free === true ? '✅' : item.free === false ? '❌' : item.free}
                </div>
                <div style={{ 
                  padding: '12px 0', 
                  borderBottom: '1px solid #eee',
                  textAlign: 'center',
                  color: '#4caf50',
                  fontWeight: 600
                }}>
                  {item.premium === true ? '✅' : item.premium}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Avantages Premium */}
        <div style={{ 
          background: 'linear-gradient(135deg, #e8f5e8 0%, #f0fff0 100%)',
          borderRadius: 24,
          padding: 32,
          marginBottom: 32,
          border: '2px solid #4caf50',
          boxShadow: '0 8px 32px rgba(76,175,80,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 600, 
            marginBottom: 24,
            textAlign: 'center',
            color: '#2e7d32'
          }}>
            🎯 Avantages Premium
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 24
          }}>
            {[
              {
                icon: '📅',
                title: 'Prévisions sur 5 jours',
                description: 'Planifiez vos activités avec des prévisions météo détaillées sur 5 jours pour toutes vos villes favorites.'
              },
              {
                icon: '🌡️',
                title: 'Données météo avancées',
                description: 'Accédez à des informations détaillées : humidité, pression, vitesse du vent et bien plus encore.'
              },
              {
                icon: '⭐',
                title: 'Favoris illimités',
                description: 'Ajoutez jusqu\'à 50 villes en favoris pour suivre la météo partout où vous allez.'
              },
              {
                icon: '🚀',
                title: 'Support prioritaire',
                description: 'Bénéficiez d\'un support client prioritaire pour toutes vos questions et demandes.'
              }
            ].map((advantage, index) => (
              <div key={index} style={{ 
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                border: '1px solid rgba(76,175,80,0.2)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: 16, textAlign: 'center' }}>
                  {advantage.icon}
                </div>
                <h3 style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: 600, 
                  marginBottom: 12,
                  color: '#2e7d32',
                  textAlign: 'center'
                }}>
                  {advantage.title}
                </h3>
                <p style={{ 
                  color: '#666', 
                  lineHeight: 1.6,
                  textAlign: 'center'
                }}>
                  {advantage.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 24,
          padding: 48,
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
        }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 700, 
            marginBottom: 16,
            color: '#fff'
          }}>
            💎 Prêt à passer en Premium ?
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#fff', 
            opacity: 0.9,
            marginBottom: 32,
            maxWidth: 500,
            margin: '0 auto 32px auto'
          }}>
            Rejoignez les utilisateurs Premium et profitez de toutes les fonctionnalités avancées pour seulement 4,99€
          </p>
          
          <button
            onClick={handleUpgrade}
            style={{
              background: '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: 16,
              padding: '16px 32px',
              fontSize: '1.3rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(76,175,80,0.3)',
              transition: 'all 0.3s ease',
              marginBottom: 16
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(76,175,80,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(76,175,80,0.3)';
            }}
          >
            🚀 Passer en Premium (4,99€)
          </button>
          
          <p style={{ 
            fontSize: '0.9rem', 
            color: '#fff', 
            opacity: 0.8,
            margin: 0
          }}>
            Paiement sécurisé via Stripe • Annulation à tout moment
          </p>
        </div>

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: 48,
          color: '#fff',
          opacity: 0.8
        }}>
          <p style={{ fontSize: '1rem', marginBottom: 8 }}>
            💡 Questions ? Contactez-nous à support@meteonext.com
          </p>
          <p style={{ fontSize: '0.9rem' }}>
            © 2024 MétéoNext - Tous droits réservés
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
} 