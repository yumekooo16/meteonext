import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('❌ Erreur de signature webhook:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  console.log('📦 Événement Stripe reçu:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
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
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`⚠️ Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Erreur lors du traitement du webhook:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session) {
  console.log('✅ Session de paiement complétée:', session.id);
  
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('❌ User ID manquant dans les métadonnées');
    return;
  }

  // Mettre à jour le statut premium de l'utilisateur
  const { error } = await supabase
    .from('profiles')
    .update({ 
      is_premium: true,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      premium_activated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('❌ Erreur mise à jour profil:', error);
  } else {
    console.log('✅ Statut premium activé pour:', userId);
  }
}

async function handleSubscriptionCreated(subscription) {
  console.log('🆕 Abonnement créé:', subscription.id);
  // Logique supplémentaire si nécessaire
}

async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Abonnement mis à jour:', subscription.id);
  
  const { error } = await supabase
    .from('profiles')
    .update({ 
      is_premium: subscription.status === 'active',
      subscription_status: subscription.status
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('❌ Erreur mise à jour abonnement:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('🗑️ Abonnement supprimé:', subscription.id);
  
  const { error } = await supabase
    .from('profiles')
    .update({ 
      is_premium: false,
      subscription_status: 'canceled',
      premium_deactivated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('❌ Erreur désactivation premium:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log('💰 Paiement réussi:', invoice.id);
  // Logique supplémentaire si nécessaire
}

async function handleInvoicePaymentFailed(invoice) {
  console.log('❌ Paiement échoué:', invoice.id);
  
  const { error } = await supabase
    .from('profiles')
    .update({ 
      subscription_status: 'past_due'
    })
    .eq('stripe_subscription_id', invoice.subscription);

  if (error) {
    console.error('❌ Erreur mise à jour statut paiement:', error);
  }
} 