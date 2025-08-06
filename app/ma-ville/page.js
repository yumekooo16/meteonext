'use client';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/context/userContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

// Clé d'API WeatherAPI
const CLE_API = "b569114b8d26441391864151252305";

export default function MaVille() {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user.connecté) {
      router.push('/form');
      return;
    }
    fetchFavorites();
  }, [user, router]);

  // Récupérer les favoris de l'utilisateur
  const fetchFavorites = async () => {
    try {
      const { data: { user: supaUser } } = await supabase.auth.getUser();
      if (!supaUser) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', supaUser.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erreur récupération favoris:', error);
        setFavorites([]);
      } else {
        setFavorites(data || []);
        // Récupérer la météo pour chaque ville favorite
        if (data && data.length > 0) {
          fetchWeatherForFavorites(data);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les prévisions sur 5 jours pour toutes les villes favorites
  const fetchWeatherForFavorites = async (favoritesList) => {
    const weatherPromises = favoritesList.map(async (favorite) => {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${CLE_API}&q=${encodeURIComponent(favorite.city_name)}&days=5&lang=fr`
        );
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        
        const data = await response.json();
        return { cityId: favorite.id, weather: data, error: false };
      } catch (error) {
        console.error(`Erreur météo pour ${favorite.city_name}:`, error);
        return { cityId: favorite.id, weather: null, error: true, errorMessage: error.message };
      }
    });

    const results = await Promise.all(weatherPromises);
    const weatherMap = {};
    const errorMap = {};
    
    results.forEach(result => {
      if (result.weather) {
        weatherMap[result.cityId] = result.weather;
      }
      if (result.error) {
        errorMap[result.cityId] = result.errorMessage || 'Erreur lors du chargement';
      }
    });
    
    setWeatherData(weatherMap);
    setErrors(errorMap);
  };

  // Supprimer un favori
  const removeFavorite = async (favId) => {
    try {
      const { error } = await supabase.from('favorites').delete().eq('id', favId);
      if (error) {
        alert("Erreur lors de la suppression : " + error.message);
      } else {
        // Rafraîchir la liste
        fetchFavorites();
      }
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  if (!user.connecté) return null;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <button
        onClick={() => router.back()}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 2,
          background: 'rgba(31,200,219,0.12)',
          color: '#1fc8db',
          border: 'none',
          borderRadius: 8,
          padding: '8px 18px',
          fontWeight: 500,
          fontSize: 16,
          cursor: 'pointer',
          boxShadow: '0 2px 8px 0 rgba(31,200,219,0.07)'
        }}
      >
        ← Retour
      </button>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: 32, textAlign: 'center', color: '#fff' }}>
          Ma ville météo
        </h1>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#fff', fontSize: '1.2rem' }}>
            Chargement de vos villes favorites...
          </div>
        ) : favorites.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#fff', 
            fontSize: '1.2rem',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 40,
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ marginBottom: 16 }}>🌍</div>
            <div style={{ marginBottom: 8 }}>Aucune ville favorite pour le moment</div>
            <div style={{ fontSize: '1rem', opacity: 0.8 }}>
              Ajoutez des villes en favoris depuis la page d'accueil pour les voir ici !
            </div>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 24,
            marginTop: 24
          }}>
            {favorites.map((favorite) => {
              const weather = weatherData[favorite.id];
              const error = errors[favorite.id];
              return (
                <div key={favorite.id} style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  position: 'relative'
                }}>
                  {/* Bouton supprimer */}
                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: '#ff6f61',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Supprimer des favoris"
                  >
                    ×
                  </button>

                  {/* Nom de la ville */}
                  <h2 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 600, 
                    marginBottom: 16,
                    color: '#1fc8db'
                  }}>
                    {favorite.city_name}
                  </h2>

                  {error ? (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#ff6f61', 
                      padding: 20,
                      fontSize: '1rem',
                      background: 'rgba(255,111,97,0.1)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,111,97,0.2)'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>⚠️</div>
                      <div style={{ marginBottom: 4 }}>Erreur de chargement</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{error}</div>
                    </div>
                  ) : weather ? (
                    <>
                      {/* Météo actuelle */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 16,
                        marginBottom: 20,
                        padding: '16px',
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderRadius: '12px'
                      }}>
                        <img
                          src={`https:${weather.current.condition.icon}`}
                          alt={weather.current.condition.text}
                          style={{ width: 48, height: 48 }}
                        />
                        <div>
                          <div style={{ 
                            fontSize: '1.8rem', 
                            fontWeight: 700,
                            color: '#1fc8db'
                          }}>
                            {weather.current.temp_c}°C
                          </div>
                          <div style={{ 
                            fontSize: '0.9rem', 
                            color: '#666',
                            marginTop: 2
                          }}>
                            {weather.current.condition.text}
                          </div>
                        </div>
                      </div>

                      {/* Prévisions sur 5 jours */}
                      <div style={{ marginBottom: 16 }}>
                        <h3 style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 600, 
                          marginBottom: 12,
                          color: '#333'
                        }}>
                          Prévisions sur 5 jours
                        </h3>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(5, 1fr)', 
                          gap: 8
                        }}>
                          {weather.forecast.forecastday.map((day, index) => {
                            const date = new Date(day.date);
                            const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
                            const dayNumber = date.getDate();
                            
                            return (
                              <div key={index} style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                borderRadius: '8px',
                                padding: '12px 8px',
                                textAlign: 'center',
                                border: '1px solid #e9ecef',
                                transition: 'transform 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                              }}
                              >
                                <div style={{ 
                                  fontSize: '0.8rem', 
                                  fontWeight: 600, 
                                  color: '#1fc8db',
                                  marginBottom: 4
                                }}>
                                  {dayName}
                                </div>
                                <div style={{ 
                                  fontSize: '0.7rem', 
                                  color: '#666', 
                                  marginBottom: 6
                                }}>
                                  {dayNumber}
                                </div>
                                
                                <img
                                  src={`https:${day.day.condition.icon}`}
                                  alt={day.day.condition.text}
                                  style={{ width: 32, height: 32, marginBottom: 6 }}
                                />
                                
                                <div style={{ 
                                  fontSize: '0.9rem', 
                                  fontWeight: 600, 
                                  color: '#333',
                                  marginBottom: 2
                                }}>
                                  {Math.round(day.day.avgtemp_c)}°C
                                </div>
                                
                                <div style={{ 
                                  fontSize: '0.6rem', 
                                  color: '#666',
                                  marginBottom: 4
                                }}>
                                  {day.day.condition.text}
                                </div>
                                
                                <div style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between',
                                  fontSize: '0.6rem',
                                  color: '#888'
                                }}>
                                  <span>Min: {Math.round(day.day.mintemp_c)}°</span>
                                  <span>Max: {Math.round(day.day.maxtemp_c)}°</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Données complémentaires */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: 12,
                        padding: '12px',
                        background: 'rgba(31,200,219,0.05)',
                        borderRadius: '8px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: 2 }}>💧 Humidité</div>
                          <div style={{ fontSize: '1rem', fontWeight: 600 }}>{weather.current.humidity}%</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: 2 }}>💨 Vent</div>
                          <div style={{ fontSize: '1rem', fontWeight: 600 }}>{weather.current.wind_kph} km/h</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: 2 }}>🔽 Pression</div>
                          <div style={{ fontSize: '1rem', fontWeight: 600 }}>{weather.current.pressure_mb} hPa</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#666', 
                      padding: 20,
                      fontSize: '1rem'
                    }}>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      Chargement des prévisions...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}