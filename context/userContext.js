'use client';
import { createContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

// Création du contexte
export const UserContext = createContext();

// Fournisseur qui gère les données du contexte
export function UserProvider({ children }) {
  const [user, setUser] = useState({ 
    nom: '', 
    email: '',
    connecté: false,
    premium: false, // Statut premium
    loading: true // Pour gérer l'état de chargement initial
  });

  // Fonction pour mettre à jour l'utilisateur à partir d'une session Supabase
  const updateUserFromSession = (session) => {
    if (session?.user) {
      setUser({
        nom: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Utilisateur',
        email: session.user.email || '',
        connecté: true,
        premium: session.user.user_metadata?.premium || false, // Récupérer le statut premium
        loading: false,
        id: session.user.id
      });
    } else {
      setUser({
        nom: '',
        email: '',
        connecté: false,
        premium: false,
        loading: false
      });
    }
  };

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser({
        nom: '',
        email: '',
        connecté: false,
        premium: false,
        loading: false
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Fonction de suppression de compte
  const deleteAccount = async () => {
    try {
      console.log('🗑️ Début de la suppression du compte...');
      
      const response = await fetch('/api/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      console.log('✅ Compte supprimé avec succès:', data);
      
      // Déconnexion après suppression réussie
      await signOut();
      
      return { success: true, message: data.message };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du compte:', error);
      return { success: false, error: error.message };
    }
  };

  // Fonction de connexion
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { success: false, error: error.message };
    }
  };

  // Fonction pour mettre à jour le statut premium
  const updatePremiumStatus = async (isPremium) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      // Mettre à jour les métadonnées utilisateur
      const { error } = await supabase.auth.updateUser({
        data: { premium: isPremium }
      });

      if (error) {
        throw error;
      }

      // Mettre à jour l'état local
      setUser(prev => ({
        ...prev,
        premium: isPremium
      }));

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut premium:', error);
      return { success: false, error: error.message };
    }
  };

  // Fonction d'inscription améliorée
  const signUp = async (email, password, fullName) => {
    try {
      console.log('🔍 Tentative d\'inscription:', { email, fullName });
      
      // Validation des données
      if (!email || !password || !fullName) {
        throw new Error('Tous les champs sont requis');
      }

      if (password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }

      // Vérification de la configuration Supabase
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Configuration Supabase manquante');
      }

      // Tentative d'inscription
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: fullName.toLowerCase().replace(/\s+/g, '_')
          },
          emailRedirectTo: `${window.location.origin}/form?confirmed=true`
        }
      });

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        
        // Gestion des erreurs spécifiques
        switch (error.message) {
          case 'User already registered':
            throw new Error('Un compte existe déjà avec cet email');
          case 'Password should be at least 6 characters':
            throw new Error('Le mot de passe doit contenir au moins 6 caractères');
          case 'Invalid email':
            throw new Error('Format d\'email invalide');
          case 'Database error saving new user':
            throw new Error('Erreur de base de données. Vérifiez la configuration Supabase.');
          default:
            throw new Error(`Erreur d'inscription: ${error.message}`);
        }
      }

      console.log('✅ Inscription réussie:', data);
      return { success: true, data };

    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        updateUserFromSession(session);
      } catch (error) {
        console.error('Erreur lors de la récupération de la session:', error);
        setUser(prev => ({ ...prev, loading: false }));
      }
    };

    // S'abonner aux changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        switch (event) {
          case 'SIGNED_IN':
            updateUserFromSession(session);
            break;
          case 'SIGNED_OUT':
            setUser({
              nom: '',
              email: '',
              connecté: false,
              premium: false,
              loading: false
            });
            break;
          case 'TOKEN_REFRESHED':
            updateUserFromSession(session);
            break;
          case 'USER_UPDATED':
            updateUserFromSession(session);
            break;
          default:
            break;
        }
      }
    );

    // Récupérer la session initiale
    getInitialSession();

    // Nettoyer l'abonnement lors du démontage
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const contextValue = {
    user,
    setUser,
    signIn,
    signUp,
    signOut,
    deleteAccount,
    updatePremiumStatus,
    updateUserFromSession
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}