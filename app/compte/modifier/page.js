'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProfileEdit from '@/components/ProfileEdit';
import AuthGuard from '@/components/AuthGuard';
import Footer from '@/components/footer';
import Toast from '@/components/Toast';

export default function ProfileEditPage() {
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Vérifier si l'utilisateur vient de modifier son profil
    const updated = searchParams.get('updated');
    if (updated === 'true') {
      setShowSuccessToast(true);
    }
  }, [searchParams]);

  return (
    <AuthGuard requireAuth={true} redirectTo="/form">
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <ProfileEdit />
        </div>
      </div>
      <Footer />

      {/* Toast de succès */}
      {showSuccessToast && (
        <Toast
          message="✅ Votre profil a été mis à jour avec succès !"
          type="success"
          duration={5000}
          onClose={() => setShowSuccessToast(false)}
        />
      )}
    </AuthGuard>
  );
} 