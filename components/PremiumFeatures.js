'use client';

import { usePremium } from '@/hooks/usePremium';
import PremiumGuard from './PremiumGuard';

export default function PremiumFeatures() {
  const { isPremium, isLoading } = usePremium();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fonctionnalité Premium 1 */}
      <PremiumGuard>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🌤️ Prévisions sur 5 jours
          </h3>
          <p className="text-gray-600 mb-4">
            Accédez aux prévisions météo détaillées sur 5 jours pour planifier vos activités.
          </p>
          <div className="grid grid-cols-5 gap-2 text-sm">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map((day, index) => (
              <div key={day} className="text-center p-2 bg-white rounded border">
                <div className="font-medium">{day}</div>
                <div className="text-2xl">🌤️</div>
                <div className="text-xs">22°C</div>
              </div>
            ))}
          </div>
        </div>
      </PremiumGuard>

      {/* Fonctionnalité Premium 2 */}
      <PremiumGuard>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📊 Données météo avancées
          </h3>
          <p className="text-gray-600 mb-4">
            Informations détaillées sur l'humidité, la pression et la vitesse du vent.
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-white rounded border">
              <div className="text-lg">💧</div>
              <div className="font-medium">Humidité</div>
              <div className="text-gray-600">65%</div>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <div className="text-lg">🌪️</div>
              <div className="font-medium">Vent</div>
              <div className="text-gray-600">12 km/h</div>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <div className="text-lg">📈</div>
              <div className="font-medium">Pression</div>
              <div className="text-gray-600">1013 hPa</div>
            </div>
          </div>
        </div>
      </PremiumGuard>

      {/* Fonctionnalité Premium 3 */}
      <PremiumGuard>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ⭐ Favoris illimités
          </h3>
          <p className="text-gray-600 mb-4">
            Ajoutez jusqu'à 50 villes en favoris pour suivre la météo partout.
          </p>
          <div className="space-y-2">
            {['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'].map((city, index) => (
              <div key={city} className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="font-medium">{city}</span>
                <span className="text-sm text-gray-600">22°C 🌤️</span>
              </div>
            ))}
          </div>
        </div>
      </PremiumGuard>

      {/* Fonctionnalité Premium 4 */}
      <PremiumGuard>
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🚀 Support prioritaire
          </h3>
          <p className="text-gray-600 mb-4">
            Bénéficiez d'un support client prioritaire pour toutes vos questions.
          </p>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Support Premium</div>
                <div className="text-sm text-gray-600">Réponse sous 2h • Priorité maximale</div>
              </div>
            </div>
          </div>
        </div>
      </PremiumGuard>
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