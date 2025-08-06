import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Récupérer les détails de la session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      customerId: session.customer,
      subscriptionId: session.subscription,
      amountTotal: session.amount_total,
      currency: session.currency,
      createdAt: session.created
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de la session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de la session' },
      { status: 500 }
    );
  }
} 