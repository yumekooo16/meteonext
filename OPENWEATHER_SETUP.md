# Configuration de l'API OpenWeather

## Erreur 401 - Clé API manquante ou invalide

L'erreur 401 indique que la clé API OpenWeather n'est pas configurée ou est invalide.

## Solution rapide

### 1. Obtenir une clé API gratuite

1. **Allez sur** [OpenWeatherMap](https://openweathermap.org/)
2. **Cliquez sur "Sign Up"** (en haut à droite)
3. **Créez un compte gratuit**
4. **Connectez-vous** à votre compte
5. **Allez dans "My API Keys"** (dans le menu utilisateur)
6. **Copiez votre clé API** (elle commence par quelque chose comme "1234567890abcdef...")

### 2. Configurer la clé dans votre code

Ouvrez le fichier `components/meteo/index.js` et remplacez :

```javascript
// Ligne 8-9
const OPENWEATHER_API_KEY = "YOUR_API_KEY"; // Remplacez par votre clé API OpenWeather
```

Par :

```javascript
const OPENWEATHER_API_KEY = "votre_vraie_cle_api_ici";
```

### 3. Redémarrer le serveur

```bash
npm run dev
```

## Fonctionnement actuel

En attendant que vous configuriez la clé API :

✅ **Votre barre de recherche fonctionne déjà** avec l'API WeatherAPI française
✅ **Fallback automatique** : Si OpenWeather échoue → WeatherAPI française
✅ **Aucune interruption** de service

## Avantages de l'API OpenWeather

Une fois configurée, vous aurez :

- 🌍 **Recherche mondiale** (villes et pays du monde entier)
- 🚀 **Plus de résultats** (5 suggestions au lieu de villes françaises uniquement)
- 📍 **Coordonnées précises** pour toutes les villes

## Limites gratuites OpenWeather

- **1000 appels par jour**
- **60 appels par minute**
- **Suffisant** pour un usage personnel

## Test

Après configuration, testez en tapant :

- "Paris" → Devrait montrer Paris, France
- "London" → Devrait montrer London, GB
- "Tokyo" → Devrait montrer Tokyo, JP

## Support

Si vous avez des problèmes :

1. Vérifiez que la clé est correctement copiée
2. Attendez 2-3 heures après création (activation différée)
3. Vérifiez les limites d'utilisation dans votre dashboard
