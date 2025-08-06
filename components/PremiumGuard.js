'use client';

import { usePremium } from '@/hooks/usePremium';
import Link from 'next/link';

export default function PremiumGuard({ children, fallback }) {
  const { isPremium, isLoading } = usePremium();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Vérification...</span>
      </div>
    );
  }

  if (!isPremium) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 text-center">
        <div className="text-blue-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Fonctionnalité Premium
        </h3>
        <p className="text-gray-600 mb-4">
          Cette fonctionnalité est réservée aux abonnés premium.
        </p>
        <Link
          href="/premium"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Découvrir Premium
        </Link>
      </div>
    );
  }

  return children;
} 