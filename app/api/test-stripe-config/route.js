import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
  try {
    // Vérifier que la clé secrète est définie
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { 
          error: 'STRIPE_SECRET_KEY non définie',
          status: 'missing_key'
        },
        { status: 500 }
      );
    }

    // Vérifier que la clé publique est définie
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      return NextResponse.json(
        { 
          error: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY non définie',
          status: 'missing_public_key'
        },
        { status: 500 }
      );
    }

    // Tester la connexion à Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Récupérer les informations du compte pour tester la connexion
    const account = await stripe.accounts.retrieve();
    
    // Récupérer votre produit
    const products = await stripe.products.list({
      limit: 10
    });

    // Chercher votre produit spécifique
    const yourProduct = products.data.find(p => p.id === 'prod_Sok7dhhDTzbMTa');
    
    // Récupérer les prix associés
    let prices = [];
    if (yourProduct) {
      prices = await stripe.prices.list({
        product: yourProduct.id,
        limit: 10
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration Stripe valide',
      account: {
        id: account.id,
        business_type: account.business_type,
        country: account.country
      },
      product: yourProduct ? {
        id: yourProduct.id,
        name: yourProduct.name,
        description: yourProduct.description,
        active: yourProduct.active
      } : null,
      prices: prices.data.map(price => ({
        id: price.id,
        unit_amount: price.unit_amount,
        currency: price.currency,
        recurring: price.recurring,
        active: price.active
      })),
      environment: process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'test' : 'live'
    });

  } catch (error) {
    console.error('Erreur test Stripe:', error);
    
    return NextResponse.json(
      { 
        error: error.message,
        status: 'stripe_error',
        details: {
          type: error.type,
          code: error.code,
          param: error.param
        }
      },
      { status: 500 }
    );
  }
} 