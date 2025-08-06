import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase/client';

// Initialiser Stripe avec la clé secrète
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Construire l'URL de base pour les webhooks
const constructWebhookUrl = () => {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = process.env.VERCEL_URL || 'localhost:3000';
  return `${protocol}://${host}/api/webhooks/stripe`;
};

export async function POST(request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('❌ Signature Stripe manquante');
      return NextResponse.json(
        { error: 'Signature manquante' },
        { status: 400 }
      );
    }

    let event;

    try {
      // Vérifier la signature du webhook
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('❌ Erreur de signature webhook:', err.message);
      return NextResponse.json(
        { error: 'Signature invalide' },
        { status: 400 }
      );
    }

    console.log('📦 Webhook reçu:', {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString()
    });

    // Traiter les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'setup_intent.created':
        console.log('🔧 Setup intent créé:', event.data.object.id);
        break;

      case 'setup_intent.succeeded':
        await handleSetupIntentSucceeded(event.data.object);
        break;

      case 'setup_intent.canceled':
        console.log('❌ Setup intent annulé:', event.data.object.id);
        break;

      default:
        console.log('⚠️ Événement non géré:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Erreur webhook Stripe:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Gérer la session de paiement complétée
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log('💰 Session de paiement complétée:', session.id);

    // Récupérer les métadonnées de la session
    const customerEmail = session.customer_details?.email;
    const userId = session.metadata?.userId;

    if (!customerEmail && !userId) {
      console.error('❌ Pas d\'email ou userId dans la session');
      return;
    }

    // Trouver l'utilisateur
    let user;
    if (userId) {
      // Utiliser l'ID utilisateur si disponible
      const { data: { user: foundUser }, error } = await supabase.auth.admin.getUserById(userId);
      if (error) {
        console.error('❌ Erreur récupération utilisateur par ID:', error);
        return;
      }
      user = foundUser;
    } else {
      // Chercher par email
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      if (error) {
        console.error('❌ Erreur récupération utilisateurs:', error);
        return;
      }
      user = users.find(u => u.email === customerEmail);
    }

    if (!user) {
      console.error('❌ Utilisateur non trouvé:', { customerEmail, userId });
      return;
    }

    // Mettre à jour le statut premium
    await updateUserPremiumStatus(user.id, true, session.id);

    console.log('✅ Statut premium mis à jour pour:', user.email);

  } catch (error) {
    console.error('❌ Erreur traitement checkout session:', error);
  }
}

// Gérer le paiement d'invoice réussi
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    console.log('💳 Paiement d\'invoice réussi:', invoice.id);

    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;

    if (!customerId) {
      console.error('❌ Pas de customer ID dans l\'invoice');
      return;
    }

    // Récupérer les informations du customer
    const customer = await stripe.customers.retrieve(customerId);
    const customerEmail = customer.email;

    if (!customerEmail) {
      console.error('❌ Pas d\'email dans le customer');
      return;
    }

    // Trouver l'utilisateur par email
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      return;
    }

    const user = users.find(u => u.email === customerEmail);
    if (!user) {
      console.error('❌ Utilisateur non trouvé:', customerEmail);
      return;
    }

    // Mettre à jour le statut premium
    await updateUserPremiumStatus(user.id, true, invoice.id);

    console.log('✅ Statut premium mis à jour pour:', user.email);

  } catch (error) {
    console.error('❌ Erreur traitement invoice payment:', error);
  }
}

// Gérer la création d'abonnement
async function handleSubscriptionCreated(subscription) {
  try {
    console.log('📅 Abonnement créé:', subscription.id);

    const customerId = subscription.customer;
    const customer = await stripe.customers.retrieve(customerId);
    const customerEmail = customer.email;

    if (!customerEmail) {
      console.error('❌ Pas d\'email dans le customer');
      return;
    }

    // Trouver l'utilisateur par email
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      return;
    }

    const user = users.find(u => u.email === customerEmail);
    if (!user) {
      console.error('❌ Utilisateur non trouvé:', customerEmail);
      return;
    }

    // Mettre à jour le statut premium
    await updateUserPremiumStatus(user.id, true, subscription.id);

    console.log('✅ Abonnement activé pour:', user.email);

  } catch (error) {
    console.error('❌ Erreur traitement création abonnement:', error);
  }
}

// Gérer la mise à jour d'abonnement
async function handleSubscriptionUpdated(subscription) {
  try {
    console.log('🔄 Abonnement mis à jour:', subscription.id);

    const customerId = subscription.customer;
    const customer = await stripe.customers.retrieve(customerId);
    const customerEmail = customer.email;

    if (!customerEmail) {
      console.error('❌ Pas d\'email dans le customer');
      return;
    }

    // Trouver l'utilisateur par email
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      return;
    }

    const user = users.find(u => u.email === customerEmail);
    if (!user) {
      console.error('❌ Utilisateur non trouvé:', customerEmail);
      return;
    }

    // Vérifier le statut de l'abonnement
    const isActive = subscription.status === 'active';
    await updateUserPremiumStatus(user.id, isActive, subscription.id);

    console.log('✅ Statut premium mis à jour pour:', user.email, 'Status:', subscription.status);

  } catch (error) {
    console.error('❌ Erreur traitement mise à jour abonnement:', error);
  }
}

// Gérer la suppression d'abonnement
async function handleSubscriptionDeleted(subscription) {
  try {
    console.log('🗑️ Abonnement supprimé:', subscription.id);

    const customerId = subscription.customer;
    const customer = await stripe.customers.retrieve(customerId);
    const customerEmail = customer.email;

    if (!customerEmail) {
      console.error('❌ Pas d\'email dans le customer');
      return;
    }

    // Trouver l'utilisateur par email
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      return;
    }

    const user = users.find(u => u.email === customerEmail);
    if (!user) {
      console.error('❌ Utilisateur non trouvé:', customerEmail);
      return;
    }

    // Désactiver le statut premium
    await updateUserPremiumStatus(user.id, false, subscription.id);

    console.log('✅ Statut premium désactivé pour:', user.email);

  } catch (error) {
    console.error('❌ Erreur traitement suppression abonnement:', error);
  }
}

// Gérer le succès du setup intent
async function handleSetupIntentSucceeded(setupIntent) {
  try {
    console.log('✅ Setup intent réussi:', setupIntent.id);

    const customerId = setupIntent.customer;
    if (!customerId) {
      console.log('ℹ️ Pas de customer ID dans le setup intent');
      return;
    }

    const customer = await stripe.customers.retrieve(customerId);
    const customerEmail = customer.email;

    if (!customerEmail) {
      console.error('❌ Pas d\'email dans le customer');
      return;
    }

    // Trouver l'utilisateur par email
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      return;
    }

    const user = users.find(u => u.email === customerEmail);
    if (!user) {
      console.error('❌ Utilisateur non trouvé:', customerEmail);
      return;
    }

    // Mettre à jour le statut premium
    await updateUserPremiumStatus(user.id, true, setupIntent.id);

    console.log('✅ Setup intent traité pour:', user.email);

  } catch (error) {
    console.error('❌ Erreur traitement setup intent:', error);
  }
}

// Fonction utilitaire pour mettre à jour le statut premium
async function updateUserPremiumStatus(userId, isPremium, paymentId) {
  try {
    console.log('🔄 Mise à jour statut premium:', { userId, isPremium, paymentId });

    // Mettre à jour les métadonnées utilisateur
    const { data: { user }, error } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: { 
          premium: isPremium,
          premium_updated_at: new Date().toISOString(),
          payment_id: paymentId
        }
      }
    );

    if (error) {
      console.error('❌ Erreur mise à jour métadonnées:', error);
      return false;
    }

    // Mettre à jour la table profiles si elle existe
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          is_premium: isPremium,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) {
        console.warn('⚠️ Erreur mise à jour table profiles:', profileError);
      }
    } catch (profileError) {
      console.warn('⚠️ Table profiles non disponible:', profileError.message);
    }

    console.log('✅ Statut premium mis à jour avec succès');
    return true;

  } catch (error) {
    console.error('❌ Erreur mise à jour statut premium:', error);
    return false;
  }
}

// Route GET pour tester la configuration webhook
export async function GET() {
  try {
    const webhookUrl = constructWebhookUrl();
    
    return NextResponse.json({
      message: 'Webhook Stripe configuré',
      webhookUrl,
      events: [
        'checkout.session.completed',
        'invoice.payment_succeeded',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'setup_intent.created',
        'setup_intent.succeeded',
        'setup_intent.canceled'
      ],
      environment: {
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur configuration webhook' },
      { status: 500 }
    );
  }
} 