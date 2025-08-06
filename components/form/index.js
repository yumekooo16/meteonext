'use client'

import React, { useState, useContext } from 'react';
import { supabase } from '../../lib/supabase/client';
import '../../app/form.css';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/context/userContext';

const Form = () => {
  const router = useRouter();
  const { signIn, signUp } = useContext(UserContext);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Validation simple pour chaque champ
  const validateFields = () => {
    const errors = {};
    if (!formData.email) errors.email = "L'email est requis.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) errors.email = "Format d'email invalide.";
    if (!isLogin && !formData.username) errors.username = "Le nom d'utilisateur est requis.";
    if (!formData.password) errors.password = "Le mot de passe est requis.";
    if (!isLogin && formData.password !== formData.confirmPassword) errors.confirmPassword = "Les mots de passe ne correspondent pas.";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setFieldErrors({});
    setForgotSuccess('');

    // Validation locale
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      if (forgotMode) {
        // Mot de passe oublié
        const { error: forgotError } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: window.location.origin + '/form?reset=1',
        });
        if (forgotError) {
          setError("Erreur lors de l'envoi de l'email de réinitialisation : " + forgotError.message);
        } else {
          setForgotSuccess("Un email de réinitialisation a été envoyé. Vérifiez votre boîte mail.");
        }
        setLoading(false);
        return;
      }
      if (isLogin) {
        // Connexion - utiliser les nouvelles fonctions du contexte
        console.log('Tentative de connexion avec:', formData.email, formData.password);
        
        const result = await signIn(formData.email, formData.password);

        if (!result.success) {
          console.error('Erreur de connexion:', result.error);
          setError(result.error);
        } else {
          setSuccess('Connexion réussie !');
          console.log('Utilisateur connecté:', result.data.user);
          router.push('/');
        }
      } else {
        // Inscription
        if (formData.password !== formData.confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          return;
        }

        console.log('Tentative d\'inscription avec:', formData.email, formData.username);

        const result = await signUp(formData.email, formData.password, formData.username);

        if (!result.success) {
          console.error('Erreur d\'inscription:', result.error);
          setError(result.error);
        } else {
          console.log('Inscription réussie:', result.data);
          
          // Redirection directe vers la page d'accueil après inscription
          console.log('✅ Inscription réussie, redirection vers la page d\'accueil');
          
          // Redirection immédiate avec window.location
          window.location.href = '/?welcome=true';

          // La redirection est déjà gérée plus haut selon la configuration Supabase
        }
      }
    } catch (err) {
      console.error('Erreur générale:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
  };

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <div className={`form-content ${isLogin ? 'login' : 'signup'}`}>  
          <p className="title">{forgotMode ? 'Mot de passe oublié' : isLogin ? 'Connexion' : 'Créer un compte'}</p>

          {/* Messages globaux */}
          {error && (
            <div className="error-message"><p>{error}</p></div>
          )}
          {success && (
            <div className="success-message">{success}</div>
          )}
          {forgotSuccess && (
            <div className="success-message">{forgotSuccess}</div>
          )}

          <form className="form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Votre email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
                className={fieldErrors.email ? 'input-error' : formData.email ? 'input-success' : ''}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
              {fieldErrors.email && <div className="field-error" id="email-error">{fieldErrors.email}</div>}
            </div>
            {!forgotMode && (
              <>
                <div className="input-group">
                  <label htmlFor="username">Nom d'utilisateur</label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Votre nom d'utilisateur"
                    value={formData.username}
                    onChange={handleInputChange}
                    required={!isLogin}
                    disabled={loading}
                    className={fieldErrors.username ? 'input-error' : formData.username ? 'input-success' : ''}
                    aria-invalid={!!fieldErrors.username}
                    aria-describedby={fieldErrors.username ? 'username-error' : undefined}
                  />
                  {fieldErrors.username && <div className="field-error" id="username-error">{fieldErrors.username}</div>}
                </div>
                <div className="input-group">
                  <label htmlFor="password">Mot de passe</label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Votre mot de passe"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className={fieldErrors.password ? 'input-error' : formData.password ? 'input-success' : ''}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  />
                  {fieldErrors.password && <div className="field-error" id="password-error">{fieldErrors.password}</div>}
                  {isLogin && (
                    <div className="forgot">
                      <button type="button" className="forgot-link" onClick={() => { setForgotMode(true); setError(''); setForgotSuccess(''); }} disabled={loading}>
                        Mot de passe oublié ?
                      </button>
                    </div>
                  )}
                </div>
                {!isLogin && (
                  <div className="input-group">
                    <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      placeholder="Confirmez votre mot de passe"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required={!isLogin}
                      disabled={loading}
                      className={fieldErrors.confirmPassword ? 'input-error' : formData.confirmPassword ? 'input-success' : ''}
                      aria-invalid={!!fieldErrors.confirmPassword}
                      aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                    />
                    {fieldErrors.confirmPassword && <div className="field-error" id="confirmPassword-error">{fieldErrors.confirmPassword}</div>}
                  </div>
                )}
              </>
            )}
            <button className="sign" type="submit" disabled={loading}>
              {loading ? 'Chargement...' : forgotMode ? 'Envoyer le lien' : (isLogin ? 'Se connecter' : 'Créer un compte')}
            </button>
            {forgotMode && (
              <button type="button" className="forgot-link" onClick={() => { setForgotMode(false); setForgotSuccess(''); setError(''); }} disabled={loading}>
                Retour à la connexion
              </button>
            )}
          </form>
          {!forgotMode && (
            <p className="signup">
              {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
              <a rel="noopener noreferrer" href="#" onClick={toggleForm}>
                {isLogin ? 'Créer un compte' : 'Se connecter'}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Form;
