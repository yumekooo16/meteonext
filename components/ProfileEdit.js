'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function ProfileEdit() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [originalData, setOriginalData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Charger les données utilisateur au montage du composant
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'utilisateur connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Erreur récupération utilisateur:', userError);
        setError('Erreur lors du chargement des données utilisateur');
        return;
      }

      setUser(user);

      // Récupérer les données du profil depuis la table profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erreur récupération profil:', profileError);
      }

      const userData = {
        name: profileData?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || ''
      };

      setFormData({
        name: userData.name,
        email: userData.email,
        newPassword: '',
        confirmPassword: ''
      });

      setOriginalData(userData);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer les messages d'erreur/succès quand l'utilisateur tape
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    // Vérifier si au moins un champ a été modifié
    const hasChanges = 
      formData.name !== originalData.name ||
      formData.email !== originalData.email ||
      formData.newPassword.length > 0;

    if (!hasChanges) {
      setError('Aucune modification détectée');
      return false;
    }

    // Validation du nom
    if (formData.name.trim().length === 0) {
      setError('Le nom ne peut pas être vide');
      return false;
    }

    // Validation de l'email
    if (formData.email && formData.email !== originalData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Format d\'email invalide');
        return false;
      }
    }

    // Validation du mot de passe
    if (formData.newPassword.length > 0) {
      if (formData.newPassword.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        return false;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return false;
      }
    }

    return true;
  };

  const updateUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const updates = {};

      // Mise à jour du nom dans la table profiles
      if (formData.name !== originalData.name) {
        console.log('🔄 Mise à jour du nom...');
        const { error: nameError } = await supabase
          .from('profiles')
          .update({ name: formData.name })
          .eq('id', user.id);

        if (nameError) {
          console.error('Erreur mise à jour nom:', nameError);
          throw new Error('Erreur lors de la mise à jour du nom');
        }
        console.log('✅ Nom mis à jour');
      }

      // Mise à jour de l'email via Supabase Auth
      if (formData.email !== originalData.email) {
        console.log('🔄 Mise à jour de l\'email...');
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });

        if (emailError) {
          console.error('Erreur mise à jour email:', emailError);
          throw new Error(`Erreur lors de la mise à jour de l'email: ${emailError.message}`);
        }
        console.log('✅ Email mis à jour');
      }

      // Mise à jour du mot de passe via Supabase Auth
      if (formData.newPassword.length > 0) {
        console.log('🔄 Mise à jour du mot de passe...');
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });

        if (passwordError) {
          console.error('Erreur mise à jour mot de passe:', passwordError);
          throw new Error(`Erreur lors de la mise à jour du mot de passe: ${passwordError.message}`);
        }
        console.log('✅ Mot de passe mis à jour');
      }

      // Mise à jour des métadonnées utilisateur
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { full_name: formData.name }
      });

      if (metadataError) {
        console.error('Erreur mise à jour métadonnées:', metadataError);
      }

      setSuccess('Profil mis à jour avec succès !');
      
      // Mettre à jour les données originales
      setOriginalData({
        name: formData.name,
        email: formData.email
      });

      // Vider les champs de mot de passe
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: ''
      }));

      // Redirection après 2 secondes
      setTimeout(() => {
        router.push('/compte?updated=true');
      }, 2000);

    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    await updateUserProfile();
  };

  const handleCancel = () => {
    // Restaurer les données originales
    setFormData({
      name: originalData.name,
      email: originalData.email,
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center text-black mb-6">
        Modifier mon profil
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom / Pseudo */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-black mb-1">
            Nom / Pseudo *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500"
            placeholder="Votre nom ou pseudo"
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
            Adresse email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500"
            placeholder="votre@email.com"
            disabled={loading}
          />
          <p className="text-xs text-black mt-1">
            Laissez vide si vous ne voulez pas changer votre email
          </p>
        </div>

        {/* Nouveau mot de passe */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-black mb-1">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500"
              placeholder="Laissez vide si inchangé"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Confirmer nouveau mot de passe */}
        {formData.newPassword.length > 0 && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Répétez le nouveau mot de passe"
              disabled={loading}
            />
          </div>
        )}

        {/* Messages d'erreur et de succès */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            {success}
          </div>
        )}

        {/* Boutons */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mise à jour...
              </div>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </form>

      {/* Informations supplémentaires */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-sm font-medium text-black mb-2">Informations :</h3>
        <ul className="text-xs text-black space-y-1">
          <li>• Seuls les champs modifiés seront mis à jour</li>
          <li>• Le changement d'email nécessitera une confirmation</li>
          <li>• Le mot de passe doit contenir au moins 6 caractères</li>
        </ul>
      </div>
    </div>
  );
} 