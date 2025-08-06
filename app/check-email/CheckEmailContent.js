'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function CheckEmailContent() {
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Récupérer l'email depuis l'URL
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }

    // Démarrer le compte à rebours pour le renvoi
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams]);

  const handleResendEmail = async () => {
    if (!email || !canResend) return;

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/form?confirmed=true`
        }
      });

      if (error) {
        console.error('Erreur lors du renvoi:', error);
        alert('Erreur lors du renvoi de l\'email. Veuillez réessayer.');
      } else {
        alert('Email de confirmation renvoyé avec succès !');
        setCanResend(false);
        setCountdown(60);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du renvoi de l\'email.');
    }
  };

  const handleBackToSignup = () => {
    router.push('/form');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Icône Email */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-6">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
            Vérifiez votre email
          </h2>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Nous avons envoyé un email de confirmation à :
            </p>
            <p className="text-lg font-medium text-gray-900 mb-6">
              {email}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Instructions
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Ouvrez votre boîte de réception</li>
                      <li>Cliquez sur le lien de confirmation</li>
                      <li>Vous serez automatiquement connecté</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton de renvoi */}
            <div className="space-y-4">
              <button
                onClick={handleResendEmail}
                disabled={!canResend}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canResend ? (
                  'Renvoyer l\'email de confirmation'
                ) : (
                  `Renvoyer dans ${countdown}s`
                )}
              </button>

              <button
                onClick={handleBackToSignup}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Retour à l'inscription
              </button>
            </div>

            {/* Conseils supplémentaires */}
            <div className="mt-6 text-xs text-gray-500">
              <p>L'email peut prendre quelques minutes à arriver.</p>
              <p>Vérifiez également vos spams si vous ne le trouvez pas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 