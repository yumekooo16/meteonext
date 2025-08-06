'use client';
import CitySearch from '@/components/CitySearch';

export default function SearchDemo() {
  const handleCitySelect = (city) => {
    console.log('Ville sélectionnée:', city);
    alert(`Ville sélectionnée: ${city.name}, ${city.country}\nLat: ${city.lat}, Lon: ${city.lon}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Recherche de Villes
          </h1>
          <p className="text-lg text-gray-600">
            Tapez le nom d'une ville ou d'un pays pour voir les suggestions
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Recherche avec OpenWeather API
          </h2>
          
          <CitySearch onCitySelect={handleCitySelect} />
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Instructions :</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Tapez 1-2 lettres pour déclencher la recherche</li>
              <li>• Utilisez les flèches ↑↓ pour naviguer</li>
              <li>• Appuyez sur Entrée pour sélectionner</li>
              <li>• Cliquez en dehors pour fermer</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 