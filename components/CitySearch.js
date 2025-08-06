'use client';
import { useState, useEffect, useRef } from 'react';

// Clé API OpenWeather (à remplacer par votre vraie clé)
const OPENWEATHER_API_KEY = "YOUR_API_KEY"; // Remplacez par votre clé API

export default function CitySearch({ onCitySelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fonction pour récupérer les suggestions via l'API OpenWeather
  const fetchSuggestions = async (searchQuery) => {
    if (searchQuery.length < 1) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=5&appid=${OPENWEATHER_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.length === 0) {
        setError('Aucune ville trouvée');
        setSuggestions([]);
      } else {
        setError('');
        setSuggestions(data);
        setIsDropdownOpen(true);
      }
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      setError('Erreur lors de la recherche. Veuillez réessayer.');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour formater l'affichage d'une ville
  const formatCityDisplay = (city) => {
    const parts = [];
    
    if (city.name) parts.push(city.name);
    if (city.state && city.state !== city.name) parts.push(city.state);
    if (city.country) parts.push(city.country);
    
    return parts.join(', ');
  };

  // Fonction pour sélectionner une ville
  const handleCitySelect = (city) => {
    const displayName = formatCityDisplay(city);
    setQuery(displayName);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    setSuggestions([]);
    setError('');
    onCitySelect?.(city);
  };

  // Gestionnaire de navigation au clavier
  const handleKeyDown = (e) => {
    if (!isDropdownOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleCitySelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Gestionnaire de changement d'input avec debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.length === 0) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      setError('');
    }
  };

  // Effet pour le debounce de 300ms
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        fetchSuggestions(query.trim());
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Gestionnaire de clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Champ de recherche */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsDropdownOpen(true);
          }}
          placeholder="Rechercher une ville ou un pays..."
          className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200 shadow-sm"
        />
        
        {/* Icône de chargement */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Dropdown des suggestions */}
      {isDropdownOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.map((city, index) => (
            <div
              key={`${city.name}-${city.lat}-${city.lon}`}
              onClick={() => handleCitySelect(city)}
              className={`px-4 py-3 cursor-pointer transition-colors duration-150 flex items-center gap-3 ${
                index === selectedIndex 
                  ? 'bg-blue-50 border-l-4 border-blue-500' 
                  : 'hover:bg-gray-50'
              } ${index < suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
              onMouseEnter={() => setSelectedIndex(index)}
              onMouseLeave={() => setSelectedIndex(-1)}
            >
              <div className="flex-shrink-0">
                <span className="text-lg">🏙️</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {city.name}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {city.state && city.state !== city.name ? `${city.state}, ` : ''}
                  {city.country}
                </div>
              </div>
              {index === selectedIndex && (
                <div className="flex-shrink-0 text-blue-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-red-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center gap-2 text-red-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Message "Aucune ville trouvée" */}
      {isDropdownOpen && suggestions.length === 0 && query.length >= 1 && !isLoading && !error && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Aucune ville trouvée</span>
          </div>
        </div>
      )}
    </div>
  );
} 