'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from "@/components/navbar";
import MeteoComponent from "@/components/meteo";
import Footer from "@/components/footer";
import Toast from "@/components/Toast";

export default function HomeClient() {
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Vérifier si l'utilisateur vient de s'inscrire
    const welcome = searchParams.get('welcome');
    if (welcome === 'true') {
      setShowWelcomeToast(true);
    }
  }, [searchParams]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          <MeteoComponent />
        </div>
        <Footer />
      </div>

      {/* Toast de bienvenue */}
      {showWelcomeToast && (
        <Toast
          message="🎉 Bienvenue ! Votre compte a été créé avec succès. Vous êtes maintenant connecté !"
          type="success"
          duration={6000}
          onClose={() => setShowWelcomeToast(false)}
        />
      )}
    </div>
  );
} 