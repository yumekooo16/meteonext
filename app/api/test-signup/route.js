import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request) {
  try {
    const { email, password, fullName } = await request.json();

    console.log('🧪 Test d\'inscription:', { email, fullName });

    // Vérification des variables d'environnement
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ Variables d\'environnement manquantes');
      return NextResponse.json(
        { error: 'Configuration Supabase manquante' },
        { status: 500 }
      );
    }

    console.log('✅ Configuration Supabase OK');

    // Test de connexion Supabase
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('✅ Connexion Supabase OK, session:', !!session);
    } catch (connError) {
      console.error('❌ Erreur de connexion Supabase:', connError);
      return NextResponse.json(
        { error: 'Impossible de se connecter à Supabase' },
        { status: 500 }
      );
    }

    // Tentative d'inscription
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          full_name: fullName,
          username: fullName.toLowerCase().replace(/\s+/g, '_')
        }
      }
    });

    if (error) {
      console.error('❌ Erreur test:', error);
      return NextResponse.json(
        { 
          error: error.message, 
          details: error,
          code: error.status || 'UNKNOWN'
        },
        { status: 400 }
      );
    }

    console.log('✅ Test réussi:', data);
    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Inscription test réussie'
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 