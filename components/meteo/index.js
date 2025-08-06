'use client'

import React, { useState, useEffect, useRef, useContext } from 'react';
import { UserContext } from '@/context/userContext';
import { supabase } from '../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import '../../app/meteo.css';

// Clé d'API WeatherAPI
const CLE_API = "b569114b8d26441391864151252305";

export default function MeteoComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const suggestionsRef = useRef(null);
  const { user } = useContext(UserContext);
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const router = useRouter();

  // Fonction pour récupérer les suggestions de villes via WeatherAPI (recherche mondiale)
  const fetchSuggestions = async (query) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    try {
      // Utiliser l'API WeatherAPI pour une recherche mondiale
      const res = await fetch(`https://api.weatherapi.com/v1/search.json?key=${CLE_API}&q=${encodeURIComponent(query)}`);
      const villes = await res.json();
      
      if (villes.length === 0) {
        setSuggestions([]);
      } else {
        // Limiter à 5 résultats et formater
        const villesLimitees = villes.slice(0, 5).map(ville => ({
          name: ville.name,
          region: ville.region || ville.country,
          country: ville.country,
          lat: ville.lat,
          lon: ville.lon
        }));
        
        setSuggestions(villesLimitees);
      }
    } catch (err) {
      console.error("Erreur lors de la recherche de ville :", err);
      setSuggestions([]);
    }
  };

  // Fonction principale de récupération météo
  const getMeteo = async (lat, lon) => {
    setLoading(true);
    setError('');
    
    let query;
    if (lat && lon) {
      query = `${lat},${lon}`;
    } else {
      query = searchQuery.trim();
    }

    if (!query) {
      setError("Veuillez entrer une ville.");
      setLoading(false);
      return;
    }

    try {
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${CLE_API}&q=${encodeURIComponent(query)}&days=10&lang=fr`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error?.message || "Erreur API");
      }

      setWeatherData(data);
      changerFond(data.current.condition.text);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la récupération des données.");
    } finally {
      setLoading(false);
    }
  };

  // Change le fond selon la météo
  const changerFond = (description) => {
    const desc = description.toLowerCase();
    let fond;
    let textColor;

    if (desc.includes("soleil") || desc.includes("ensoleillé") || desc.includes("clear")) {
      fond = 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)'; // Dégradé doré pour le soleil
      textColor = '#1a1a1a';  // Texte foncé pour la lisibilité
    } else if (desc.includes("nuage") || desc.includes("couvert") || desc.includes("cloud")) {
      fond = 'linear-gradient(135deg, #e0e0e0 0%, #b0c4de 100%)'; // Dégradé gris-bleu pour les nuages
      textColor = '#2a2a2a';
    } else if (desc.includes("pluie") || desc.includes("averse") || desc.includes("orage") || desc.includes("rain")) {
      fond = 'linear-gradient(135deg, #4682b4 0%, #483d8b 100%)'; // Dégradé bleu foncé pour la pluie
      textColor = '#ffffff';
    } else if (desc.includes("brume") || desc.includes("brouillard") || desc.includes("mist") || desc.includes("fog")) {
      fond = 'linear-gradient(135deg, #dcdcdc 0%, #c0c0c0 100%)'; // Dégradé gris clair pour la brume
      textColor = '#333333';
    } else if (desc.includes("neige") || desc.includes("snow")) {
      fond = 'linear-gradient(135deg, #f0f8ff 0%, #e6e6fa 100%)'; // Dégradé blanc-bleuté pour la neige
      textColor = '#2a2a2a';
    } else {
      fond = 'linear-gradient(135deg, #87ceeb 0%, #4169e1 100%)'; // Dégradé bleu ciel par défaut
      textColor = '#ffffff';
    }

    document.body.style.background = fond;
    document.body.style.color = textColor;
    document.body.style.transition = 'background 0.5s ease-in-out, color 0.5s ease-in-out';
  };

  // Gestionnaire de soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCoords) {
      getMeteo(selectedCoords.lat, selectedCoords.lon);
    } else {
      getMeteo();
    }
  };

  // Gestionnaire de sélection d'une suggestion
  const handleSuggestionClick = (ville) => {
    setSearchQuery(`${ville.name}, ${ville.region}`);
    setSuggestions([]);
    setSelectedCoords({
      lat: ville.lat,
      lon: ville.lon
    });
    getMeteo(ville.lat, ville.lon);
  };

  // Effet pour récupérer les suggestions quand la requête change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchSuggestions(searchQuery.trim());
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Gestionnaire de clic en dehors du dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          !event.target.closest('.meteo-search')) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Effet pour réinitialiser les coordonnées quand on tape
  useEffect(() => {
    setSelectedCoords(null);
  }, [searchQuery]);

  // Ajout : utilitaire pour vérifier si une ville est déjà dans les favoris
  const isInFavorites = (cityName) => favorites.some(fav => fav.city_name.toLowerCase() === cityName.toLowerCase());

  // Ajout : fonction pour ajouter un favori
  const addFavorite = async (cityName) => {
    if (!user || !user.connecté) return;
    const { data: { user: supaUser } } = await supabase.auth.getUser();
    if (!supaUser) return;
    
    // Limite différente selon le statut premium
    const maxFavorites = user.premium ? 50 : 3; // 50 favoris pour les premium, 3 pour les autres
    
    if (favorites.length >= maxFavorites) {
      if (user.premium) {
        alert('Vous avez atteint la limite de 50 favoris.');
      } else {
        alert('Vous ne pouvez avoir que 3 favoris. Passez en PREMIUM pour avoir des favoris illimités !');
      }
      return;
    }
    
    if (isInFavorites(cityName)) {
      alert('Cette ville est déjà dans vos favoris.');
      return;
    }
    
    const { error } = await supabase.from('favorites').insert({
      user_id: supaUser.id,
      city_name: cityName
    });
    if (error) {
      alert("Erreur lors de l'ajout du favori : " + error.message);
    } else {
      // Rafraîchir la liste
      fetchFavorites();
    }
  };

  // Ajout : fonction pour supprimer un favori
  const removeFavorite = async (favId) => {
    const { error } = await supabase.from('favorites').delete().eq('id', favId);
    if (error) {
      alert("Erreur lors de la suppression : " + error.message);
    } else {
      fetchFavorites();
    }
  };

  // Fonction pour récupérer les favoris (déplacée en dehors du useEffect)
  const fetchFavorites = async () => {
    if (!user || !user.connecté) {
      setFavorites([]);
      return;
    }
    setFavoritesLoading(true);
    // Récupérer l'utilisateur courant Supabase
    const { data: { user: supaUser } } = await supabase.auth.getUser();
    if (!supaUser) {
      setFavorites([]);
      setFavoritesLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', supaUser.id)
      .order('created_at', { ascending: true });
    if (error) {
      setFavorites([]);
    } else {
      setFavorites(data);
    }
    setFavoritesLoading(false);
  };

  // Récupérer les favoris de l'utilisateur connecté
  useEffect(() => {
    fetchFavorites();
  }, [user]);

  return (
    <div className="meteo-container">
      {/* Barre de recherche avec autocomplétion mondiale */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} className="meteo-search">
          <input
            type="text"
            id="recherche"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une ville ou un pays..."
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '1rem',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              outline: 'none',
              transition: 'all 0.2s ease',
              background: '#fff',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          />
          <button type="submit" aria-label="Rechercher">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </form>

        {/* Dropdown des suggestions amélioré */}
        {suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #e1e5e9',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto',
              marginTop: '4px'
            }}
          >
            {suggestions.map((ville, index) => (
              <div
                key={`${ville.name}-${ville.lat}-${ville.lon}`}
                onClick={() => handleSuggestionClick(ville)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: 'transparent',
                  borderBottom: index < suggestions.length - 1 ? '1px solid #f1f3f4' : 'none',
                  color: '#333',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: '1.2em' }}>🏙️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#1a1a1a' }}>
                    {ville.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {ville.region && ville.region !== ville.country ? `${ville.region}, ` : ''}
                    {ville.country}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message "Aucune ville trouvée" */}
        {searchQuery.length >= 1 && suggestions.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #e1e5e9',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              padding: '16px',
              textAlign: 'center',
              color: '#666',
              fontSize: '0.9rem',
              marginTop: '4px'
            }}
          >
            Aucune ville trouvée
          </div>
        )}
      </div>
      {/* Favoris minimalistes */}
      {user && user.connecté && (
        <div className="favoris-list">
          {favoritesLoading ? (
            <span>Chargement...</span>
          ) : favorites.length === 0 ? (
            <span style={{color:'#bbb'}}>Aucun favori</span>
          ) : (
            favorites.map((fav) => (
              <div key={fav.id} style={{ position: 'relative' }}>
                <button
                  className="favoris-btn"
                  onClick={() => {
                    setSearchQuery(fav.city_name);
                    getMeteo(undefined, undefined, fav.city_name);
                  }}
                >
                  {fav.city_name}
                </button>
                <span
                  className="favoris-remove"
                  onClick={() => removeFavorite(fav.id)}
                  title="Supprimer ce favori"
                >
                  ×
                </span>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Bouton Ma ville météo */}
      {user && user.connecté && (
        <button
          onClick={() => router.push('/ma-ville')}
          style={{
            marginTop: 16,
            padding: '12px 24px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 16,
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
          }}
        >
          🌍 Ma ville météo
        </button>
      )}
      {/* Affichage des erreurs */}
      {error && (
        <div style={{color:'#ff6f61',marginTop:8}}>{error}</div>
      )}
      {/* Affichage météo principale */}
      {weatherData && (
        <div className="meteo-main">
          <img
            className="meteo-icon"
            src={`https:${weatherData.current.condition.icon}`}
            alt={weatherData.current.condition.text}
          />
          <div className="meteo-temp">{weatherData.current.temp_c}°C</div>
          <div className="meteo-desc">{weatherData.current.condition.text}</div>
          <div className="meteo-badges">
            <span className="meteo-badge">💧 {weatherData.current.humidity}%</span>
            <span className="meteo-badge">💨 {weatherData.current.wind_kph} km/h</span>
            <span className="meteo-badge">🔽 {weatherData.current.pressure_mb} hPa</span>
          </div>
          {/* Bouton ajouter aux favoris */}
          {user && user.connecté && !isInFavorites(weatherData.location.name) && favorites.length < (user.premium ? 50 : 3) && (
            <button
              style={{ marginTop: 12, padding: '8px 16px', borderRadius: 8, background: '#1fc8db', color: 'white', border: 'none', cursor: 'pointer', fontWeight:600 }}
              onClick={() => addFavorite(weatherData.location.name)}
            >
              + Ajouter {weatherData.location.name} aux favoris
            </button>
          )}
        </div>
      )}
      
      {/* Message d'incitation Premium */}
      {weatherData && (!user?.connecté || !user?.premium) && (
        <div style={{
          marginTop: 32,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#1fc8db', marginBottom: 16 }}>
            🔒 Prévisions sur 5 jours réservées aux membres Premium
          </h3>
          <p style={{ marginBottom: 20, color: '#666' }}>
            Accédez aux prévisions détaillées et à bien plus encore !
          </p>
          <button
            onClick={() => router.push('/premium')}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 16,
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Passer en Premium
          </button>
        </div>
      )}

      {/* Prévisions sur 5 jours - uniquement pour les utilisateurs Premium */}
      {weatherData && user?.connecté && user?.premium && weatherData.forecast && weatherData.forecast.forecastday && (
        <div style={{ 
          marginTop: 32,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{ 
            fontSize: '1.8rem', 
            fontWeight: 600, 
            marginBottom: 20,
            color: '#1fc8db',
            textAlign: 'center'
          }}>
            Prévisions sur 5 jours
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: 16
          }}>
            {weatherData.forecast.forecastday.slice(0, 5).map((day, index) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
              const dayNumber = date.getDate();
              const month = date.toLocaleDateString('fr-FR', { month: 'short' });
              
              return (
                <div key={index} style={{ 
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderRadius: 16,
                  padding: 16,
                  textAlign: 'center',
                  border: '1px solid rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease'
                }}>
                  <div style={{ 
                    fontWeight: 600, 
                    color: '#1fc8db', 
                    marginBottom: 8,
                    fontSize: '0.9rem'
                  }}>
                    {dayName}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#666', 
                    marginBottom: 12
                  }}>
                    {dayNumber} {month}
                  </div>
                  
                  <img
                    src={`https:${day.day.condition.icon}`}
                    alt={day.day.condition.text}
                    style={{ width: 48, height: 48, marginBottom: 8 }}
                  />
                  
                  <div style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: 600, 
                    color: '#000',
                    marginBottom: 4
                  }}>
                    {Math.round(day.day.avgtemp_c)}°C
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#666',
                    marginBottom: 8
                  }}>
                    {day.day.condition.text}
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '0.7rem',
                    color: '#888'
                  }}>
                    <span>Min: {Math.round(day.day.mintemp_c)}°</span>
                    <span>Max: {Math.round(day.day.maxtemp_c)}°</span>
                  </div>
                  
                  <div style={{ 
                    marginTop: 8,
                    fontSize: '0.7rem',
                    color: '#666'
                  }}>
                    💧 {day.day.avghumidity}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Loader */}
      {loading && <div style={{marginTop:16}}>Chargement...</div>}
    </div>
  );
}
