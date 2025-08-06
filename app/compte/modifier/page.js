import { Suspense } from 'react';
import CompteModifierClient from './CompteModifierClient';

export default function ProfileEditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    }>
      <CompteModifierClient />
    </Suspense>
  );
} 