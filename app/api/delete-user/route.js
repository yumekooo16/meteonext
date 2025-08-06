import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function DELETE(request) {
  try {
    // Récupérer l'utilisateur connecté depuis le token
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Erreur authentification:', authError);
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    console.log('🔍 Suppression de l\'utilisateur:', user.id, user.email);

    // 1. Supprimer les relations (favoris)
    console.log('🗑️ Suppression des favoris...');
    const { error: favoritesError } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id);

    if (favoritesError) {
      console.error('❌ Erreur suppression favoris:', favoritesError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression des favoris' },
        { status: 500 }
      );
    }

    console.log('✅ Favoris supprimés avec succès');

    // 2. Supprimer le profil (si table profiles existe)
    console.log('🗑️ Suppression du profil...');
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      console.error('❌ Erreur suppression profil:', profileError);
      // Ne pas échouer si la table profiles n'existe pas encore
      console.log('⚠️ Table profiles non trouvée, continuation...');
    } else {
      console.log('✅ Profil supprimé avec succès');
    }

    // 2. Supprimer l'utilisateur de Supabase Auth
    console.log('🗑️ Suppression de l\'utilisateur Auth...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('❌ Erreur suppression utilisateur:', deleteError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'utilisateur' },
        { status: 500 }
      );
    }

    console.log('✅ Utilisateur supprimé avec succès');

    return NextResponse.json({
      success: true,
      message: 'Compte supprimé avec succès',
      userId: user.id
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression' },
      { status: 500 }
    );
  }
} 