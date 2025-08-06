'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import FormComponent from "@/components/form";
import AuthGuard from "@/components/AuthGuard";
import Footer from "@/components/footer";
import Toast from "@/components/Toast";

export default function FormPage() {
  const [showConfirmedToast, setShowConfirmedToast] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Vérifier si l'utilisateur vient de confirmer son email
    const confirmed = searchParams.get('confirmed');
    if (confirmed === 'true') {
      setShowConfirmedToast(true);
    }
  }, [searchParams]);

  return (
    <AuthGuard requireAuth={false} redirectTo="/">
      <div data-page="form" className="min-h-screen">
        <FormComponent />
      </div>
      <Footer />

      {/* Toast de confirmation email */}
      {showConfirmedToast && (
        <Toast
          message="✅ Votre email a été confirmé avec succès !"
          type="success"
          duration={5000}
          onClose={() => setShowConfirmedToast(false)}
        />
      )}
    </AuthGuard>
  );
} 