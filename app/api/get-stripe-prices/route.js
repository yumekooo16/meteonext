import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';

export async function GET() {
  try {
    // Récupérer tous les prix pour votre produit
    const prices = await stripe.prices.list({
      product: 'prod_Sok7dhhDTzbMTa',
      active: true,
      expand: ['data.product']
    });

    return NextResponse.json({
      success: true,
      prices: prices.data.map(price => ({
        id: price.id,
        unit_amount: price.unit_amount,
        currency: price.currency,
        recurring: price.recurring,
        product: {
          id: price.product.id,
          name: price.product.name,
          description: price.product.description
        }
      }))
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des prix:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des prix' },
      { status: 500 }
    );
  }
} 