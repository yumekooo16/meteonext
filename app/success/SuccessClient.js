'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionId) {
      // Optionnel : vérifier le statut de la session
      verifySession(sessionId);
    } else {
      setIsLoading(false);
    }
  }, [sessionId]);

  const verifySession = async (sessionId) => {
    try {
      const response = await fetch('/api/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la vérification');
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Erreur vérification session:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de votre paiement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erreur de vérification
          </h1>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <Link
            href="/premium"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Retourner à la page premium
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-green-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Paiement réussi !
        </h1>
        
        <p className="text-gray-600 mb-6">
          Votre abonnement premium a été activé avec succès. 
          Vous avez maintenant accès à toutes les fonctionnalités avancées.
        </p>

        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-2">
            Votre abonnement
          </h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>✅ Abonnement Premium Météo</p>
            <p>✅ Paiement sécurisé par Stripe</p>
            <p>✅ Renouvellement automatique mensuel</p>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Retourner à l'accueil
          </Link>
          
          <Link
            href="/compte"
            className="block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition duration-200"
          >
            Gérer mon compte
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Un email de confirmation vous a été envoyé avec les détails de votre abonnement.
        </p>
      </div>
    </div>
  );
} 