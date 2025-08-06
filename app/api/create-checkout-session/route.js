import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/client'

export async function POST(request) {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin')
    
    // Récupérer les données du body
    const body = await request.json()
    const { items } = body

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      line_items: items,
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/compte?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_creation: 'always',
      metadata: {
        // Ajoutez des métadonnées si nécessaire
        source: 'web_checkout'
      }
    });

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id 
    })
  } catch (err) {
    console.error('Erreur Stripe:', err)
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    )
  }
}