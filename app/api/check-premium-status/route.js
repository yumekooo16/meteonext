import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request) {
  try {
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer le profil utilisateur avec le statut premium
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_premium, subscription_status, stripe_subscription_id, premium_activated_at')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Erreur récupération profil:', profileError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du profil' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      isPremium: profile?.is_premium || false,
      subscriptionStatus: profile?.subscription_status || null,
      subscriptionId: profile?.stripe_subscription_id || null,
      activatedAt: profile?.premium_activated_at || null
    });

  } catch (error) {
    console.error('❌ Erreur vérification statut premium:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Endpoint POST pour forcer la synchronisation
export async function POST(request) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const userEmail = user.email;

    // Récupérer le subscription_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_id')
      .eq('id', userId)
      .single();

    const subscriptionId = profile?.subscription_id || user.user_metadata?.subscription_id;

    if (!subscriptionId) {
      return NextResponse.json({
        success: false,
        error: 'Aucun abonnement trouvé'
      });
    }

    // Vérifier le statut chez Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const isActive = subscription.status === 'active';

    // Mettre à jour le statut
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { 
        premium: isActive, 
        subscription_id: subscriptionId,
        synced_at: new Date().toISOString()
      }
    });

    await supabase
      .from('profiles')
      .update({ 
        premium: isActive,
        subscription_id: subscriptionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    return NextResponse.json({
      success: true,
      premium: isActive,
      subscription: {
        id: subscriptionId,
        status: subscription.status,
        synced: true
      }
    });

  } catch (error) {
    console.error('❌ Erreur synchronisation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation' },
      { status: 500 }
    );
  }
} 