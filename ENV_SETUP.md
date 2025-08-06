# 🔧 Configuration des Variables d'Environnement

## 📋 **Variables Requises**

Créez un fichier `.env.local` à la racine de votre projet avec toutes ces variables :

```env
# ========================================
# 🔑 SUPABASE CONFIGURATION
# ========================================

# URL de votre projet Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co

# Clé anonyme (publique) - Frontend
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clé service role (privée) - Backend/Webhooks
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ========================================
# 💳 STRIPE CONFIGURATION
# ========================================

# Clé secrète Stripe (privée) - Backend
STRIPE_SECRET_KEY=sk_test_...

# Clé publique Stripe (publique) - Frontend
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Clé secrète webhook Stripe (privée) - Webhooks
STRIPE_WEBHOOK_SECRET=whsec_...

# ========================================
# 🌤️ WEATHER API CONFIGURATION
# ========================================

# Clé API WeatherAPI
NEXT_PUBLIC_WEATHER_API_KEY=b569114b8d26441391864151252305

# ========================================
# 🚀 ENVIRONMENT CONFIGURATION
# ========================================

# Environnement (development/production)
NODE_ENV=development

# URL de base pour les webhooks (production)
VERCEL_URL=https://votre-app.vercel.app
```

## 🔍 **Où Trouver Ces Clés**

### **1. Clés Supabase**

#### **A. Accéder au Dashboard Supabase**

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet

#### **B. Récupérer les Clés**

1. **Settings** → **API**
2. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ IMPORTANT :** La clé `service_role` a des privilèges admin. Ne l'exposez JAMAIS côté client !

### **2. Clés Stripe**

#### **A. Accéder au Dashboard Stripe**

1. Allez sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Connectez-vous à votre compte
3. Assurez-vous d'être en mode **Test** pour le développement

#### **B. Récupérer les Clés**

1. **Developers** → **API keys**
2. **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. **Secret key** → `STRIPE_SECRET_KEY`

#### **C. Configurer les Webhooks**

1. **Developers** → **Webhooks**
2. Cliquez sur **Add endpoint**
3. URL : `https://votre-domaine.com/api/webhooks/stripe`
4. Sélectionnez les événements :
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `setup_intent.created`
   - `setup_intent.succeeded`
   - `setup_intent.canceled`
5. Cliquez sur **Add endpoint**
6. **Reveal** → `STRIPE_WEBHOOK_SECRET`

### **3. Clé WeatherAPI**

#### **A. Accéder à WeatherAPI**

1. Allez sur [weatherapi.com](https://weatherapi.com)
2. Créez un compte gratuit
3. Récupérez votre clé API

#### **B. Utilisation**

```javascript
// Dans votre code
const CLE_API = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
```

## 🚀 **Configuration par Environnement**

### **Développement Local**

```env
NODE_ENV=development
VERCEL_URL=localhost:3000
```

### **Production (Vercel)**

```env
NODE_ENV=production
VERCEL_URL=https://votre-app.vercel.app
```

## 🔒 **Sécurité**

### **Variables Publiques (NEXT*PUBLIC*)**

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ✅ `NEXT_PUBLIC_WEATHER_API_KEY`

### **Variables Privées (Sans NEXT*PUBLIC*)**

- 🔒 `SUPABASE_SERVICE_ROLE_KEY`
- 🔒 `STRIPE_SECRET_KEY`
- 🔒 `STRIPE_WEBHOOK_SECRET`

## 🧪 **Test de Configuration**

### **1. Test des Variables Supabase**

```bash
# Vérifier que les variables sont chargées
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### **2. Test des Variables Stripe**

```bash
# Vérifier les clés Stripe
echo $STRIPE_SECRET_KEY
echo $STRIPE_WEBHOOK_SECRET
```

### **3. Test de l'API Webhook**

```bash
# Tester l'endpoint webhook
curl http://localhost:3000/api/webhooks/stripe
```

**Réponse attendue :**

```json
{
  "message": "Webhook Stripe configuré",
  "webhookUrl": "http://localhost:3000/api/webhooks/stripe",
  "environment": {
    "hasStripeKey": true,
    "hasWebhookSecret": true,
    "nodeEnv": "development"
  }
}
```

## 🚨 **Erreurs Courantes**

### **1. "Missing environment variable"**

```bash
# Vérifier que le fichier .env.local existe
ls -la .env.local

# Vérifier le contenu
cat .env.local
```

### **2. "Invalid API key"**

```bash
# Vérifier le format des clés
# Supabase : doit commencer par eyJ...
# Stripe : doit commencer par sk_test_ ou pk_test_
```

### **3. "Webhook signature verification failed"**

```bash
# Vérifier la clé webhook
echo $STRIPE_WEBHOOK_SECRET
# Doit commencer par whsec_...
```

## 📝 **Exemple de .env.local Complet**

```env
# ========================================
# 🔑 SUPABASE CONFIGURATION
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxOTUwMTQzODkwfQ.example
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM0NTY3ODkwLCJleHAiOjE5NTAxNDM4OTB9.example

# ========================================
# 💳 STRIPE CONFIGURATION
# ========================================
STRIPE_SECRET_KEY=sk_test_51ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
STRIPE_WEBHOOK_SECRET=whsec_abcdefghijklmnopqrstuvwxyz1234567890

# ========================================
# 🌤️ WEATHER API CONFIGURATION
# ========================================
NEXT_PUBLIC_WEATHER_API_KEY=b569114b8d26441391864151252305

# ========================================
# 🚀 ENVIRONMENT CONFIGURATION
# ========================================
NODE_ENV=development
VERCEL_URL=localhost:3000
```

## ✅ **Checklist de Configuration**

- [ ] **Fichier .env.local** créé à la racine
- [ ] **Clés Supabase** configurées
- [ ] **Clés Stripe** configurées
- [ ] **Webhook Stripe** configuré
- [ ] **Clé WeatherAPI** configurée
- [ ] **Variables publiques** avec préfixe NEXT*PUBLIC*
- [ ] **Variables privées** sans préfixe
- [ ] **Test de configuration** réussi
- [ ] **Redémarrage du serveur** après modification

## 🎯 **Vérification Finale**

```bash
# 1. Redémarrer le serveur
npm run dev

# 2. Tester l'API webhook
curl http://localhost:3000/api/webhooks/stripe

# 3. Vérifier les logs
# Devrait afficher : "Webhook Stripe configuré"
```

Une fois toutes ces variables configurées, votre système de paiement Stripe et d'authentification Supabase sera complètement fonctionnel ! 🚀
