import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    console.log('🔍 Vérification des tables...');

    // Vérifier la table profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    console.log('📊 Table profiles:', { data: profilesData, error: profilesError });

    // Vérifier la table users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    console.log('📊 Table users:', { data: usersData, error: usersError });

    // Vérifier la table favorites
    const { data: favoritesData, error: favoritesError } = await supabase
      .from('favorites')
      .select('*')
      .limit(1);

    console.log('📊 Table favorites:', { data: favoritesData, error: favoritesError });

    // Récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    return NextResponse.json({
      success: true,
      tables: {
        profiles: {
          exists: !profilesError,
          error: profilesError?.message || null,
          data: profilesData
        },
        users: {
          exists: !usersError,
          error: usersError?.message || null,
          data: usersData
        },
        favorites: {
          exists: !favoritesError,
          error: favoritesError?.message || null,
          data: favoritesData
        }
      },
      currentUser: user ? {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      } : null,
      userError: userError?.message || null
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 