import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request) {
  try {
    const { userId, sessionId } = await request.json();

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'userId et sessionId requis' },
        { status: 400 }
      );
    }

    // Vérifier que la session Stripe est bien payée
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Paiement non confirmé' },
        { status: 400 }
      );
    }

    // Mettre à jour les métadonnées utilisateur dans Supabase
    const { data: { user }, error } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: { premium: true }
      }
    );

    if (error) {
      console.error('Erreur lors de la mise à jour:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du statut premium' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Statut premium mis à jour avec succès',
      user: {
        id: user.id,
        email: user.email,
        premium: true
      }
    });

  } catch (error) {
    console.error('Erreur API update-premium:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 