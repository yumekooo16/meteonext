# Configuration du Système d'Abonnement Premium avec Stripe

## 🚀 Vue d'ensemble

Ce système permet d'intégrer un abonnement premium mensuel avec Stripe dans votre application Next.js. Il inclut :

- Création de sessions de paiement Stripe
- Webhooks pour gérer les événements d'abonnement
- Vérification du statut premium
- Composants React pour l'interface utilisateur
- Protection des fonctionnalités premium

## 📋 Prérequis

1. **Compte Stripe** avec un produit configuré (ID: `prod_Sok7dhhDTzbMTa`)
2. **Base de données Supabase** avec une table `profiles`
3. **Variables d'environnement** configurées

## 🔧 Configuration

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_... # Votre clé secrète Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Votre clé publique Stripe
STRIPE_WEBHOOK_SECRET=whsec_... # Secret du webhook (à configurer)

# Supabase (déjà configuré)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# URL de base (optionnel)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Configuration de la base de données

Assurez-vous que votre table `profiles` dans Supabase contient les colonnes suivantes :

```sql
-- Ajoutez ces colonnes à votre table profiles existante
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_activated_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_deactivated_at TIMESTAMP;
```

### 3. Configuration du Price ID

**⚠️ IMPORTANT :** Vous devez obtenir le `price_id` de votre produit Stripe.

1. Allez dans votre dashboard Stripe
2. Naviguez vers **Produits** → Votre produit (`prod_Sok7dhhDTzbMTa`)
3. Créez un prix récurrent mensuel (si pas déjà fait)
4. Copiez le `price_id` (commence par `price_`)

Mettez à jour le fichier `app/api/create-checkout-session/route.js` :

```javascript
// Remplacez cette ligne
price: 'price_1OqX7dhhDTzbMTa', // Remplacez par votre price_id
```

### 4. Configuration du Webhook Stripe

1. Dans votre dashboard Stripe, allez dans **Développeurs** → **Webhooks**
2. Cliquez sur **Ajouter un endpoint**
3. URL : `https://votre-domaine.com/api/webhooks/stripe`
4. Événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copiez le **Signing secret** et ajoutez-le à `STRIPE_WEBHOOK_SECRET`

## 🎯 Utilisation

### 1. Composant de Checkout

```jsx
import PremiumCheckout from "@/components/PremiumCheckout";

export default function MaPage() {
  return (
    <div>
      <h1>Passez en Premium</h1>
      <PremiumCheckout />
    </div>
  );
}
```

### 2. Protection des fonctionnalités premium

```jsx
import PremiumGuard from "@/components/PremiumGuard";

export default function MaPage() {
  return (
    <div>
      <h1>Fonctionnalités Premium</h1>

      <PremiumGuard>
        <div>
          {/* Contenu réservé aux utilisateurs premium */}
          <h2>Prévisions sur 5 jours</h2>
          <p>Contenu premium...</p>
        </div>
      </PremiumGuard>
    </div>
  );
}
```

### 3. Vérification du statut premium

```jsx
import { usePremium } from "@/hooks/usePremium";

export default function MonComposant() {
  const { isPremium, isLoading, error } = usePremium();

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      {isPremium ? (
        <div>Vous êtes premium ! 🎉</div>
      ) : (
        <div>Passez en premium pour plus de fonctionnalités</div>
      )}
    </div>
  );
}
```

## 🔄 Flux de paiement

1. **Utilisateur clique sur "Souscrire"**

   - Le composant `PremiumCheckout` appelle `/api/create-checkout-session`
   - Une session Stripe est créée avec le `price_id`

2. **Redirection vers Stripe Checkout**

   - L'utilisateur est redirigé vers la page de paiement Stripe
   - Il saisit ses informations de carte

3. **Paiement réussi**

   - Stripe redirige vers `/success?session_id=...`
   - Le webhook `checkout.session.completed` est déclenché
   - Le statut premium est activé dans la base de données

4. **Paiement échoué/annulé**
   - Stripe redirige vers `/premium?canceled=true`
   - L'utilisateur peut réessayer

## 🛠️ API Routes

### `/api/create-checkout-session`

- **Méthode :** POST
- **Body :** `{ userId: string }`
- **Retour :** `{ sessionId: string }`

### `/api/check-premium-status`

- **Méthode :** GET
- **Retour :** `{ isPremium: boolean, subscriptionStatus: string, ... }`

### `/api/verify-session`

- **Méthode :** POST
- **Body :** `{ sessionId: string }`
- **Retour :** Détails de la session Stripe

### `/api/webhooks/stripe`

- **Méthode :** POST
- **Gère :** Tous les événements d'abonnement Stripe

## 🧪 Test

### Mode développement

1. Utilisez les cartes de test Stripe :

   - **Succès :** `4242 4242 4242 4242`
   - **Échec :** `4000 0000 0000 0002`

2. Testez le webhook localement avec Stripe CLI :
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### Mode production

1. Configurez les webhooks Stripe avec votre domaine
2. Utilisez les vraies clés Stripe (pas les clés de test)
3. Testez avec de vrais paiements

## 🔒 Sécurité

- ✅ Vérification de signature des webhooks
- ✅ Authentification utilisateur requise
- ✅ Validation des données d'entrée
- ✅ Gestion des erreurs sécurisée

## 🐛 Dépannage

### Erreur "Price ID not found"

- Vérifiez que le `price_id` est correct dans `create-checkout-session/route.js`
- Assurez-vous que le prix est actif dans Stripe

### Webhook non reçu

- Vérifiez l'URL du webhook dans Stripe
- Testez avec Stripe CLI en local
- Vérifiez les logs de votre application

### Statut premium non mis à jour

- Vérifiez que la table `profiles` a les bonnes colonnes
- Vérifiez les logs du webhook
- Testez manuellement l'API `/api/check-premium-status`

## 📞 Support

Pour toute question ou problème :

1. Vérifiez les logs de votre application
2. Consultez la documentation Stripe
3. Testez avec les outils de développement Stripe

---

**Note :** Ce système est conçu pour être simple et robuste. Il peut être étendu avec des fonctionnalités supplémentaires comme la gestion des annulations, les remboursements, etc.
