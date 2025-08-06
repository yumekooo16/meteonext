import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const diagnosis = {
    timestamp: new Date().toISOString(),
    environment: {},
    connection: {},
    auth: {},
    database: {},
    recommendations: []
  };

  try {
    // 1. Vérification des variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    diagnosis.environment = {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseKey,
      hasServiceRoleKey: !!serviceRoleKey,
      urlFormat: supabaseUrl ? (supabaseUrl.startsWith('https://') ? 'valid' : 'invalid') : 'missing',
      anonKeyLength: supabaseKey ? supabaseKey.length : 0,
      serviceRoleKeyLength: serviceRoleKey ? serviceRoleKey.length : 0
    };

    if (!supabaseUrl || !supabaseKey) {
      diagnosis.recommendations.push('❌ Variables d\'environnement manquantes');
      return NextResponse.json(diagnosis, { status: 400 });
    }

    // 2. Test de connexion
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      diagnosis.connection = {
        success: !sessionError,
        error: sessionError?.message || null,
        hasSession: !!session
      };
    } catch (connError) {
      diagnosis.connection = {
        success: false,
        error: connError.message
      };
    }

    // 3. Test d'authentification
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'test-diagnosis@example.com',
        password: 'test123456',
        options: {
          data: { full_name: 'Test Diagnosis' }
        }
      });

      diagnosis.auth = {
        signupSuccess: !error,
        error: error?.message || null,
        errorCode: error?.status || null,
        hasUser: !!data?.user,
        userEmail: data?.user?.email || null
      };

      // Si l'inscription a réussi, supprimer l'utilisateur de test
      if (data?.user && serviceRoleKey) {
        const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
        await adminSupabase.auth.admin.deleteUser(data.user.id);
      }

    } catch (authError) {
      diagnosis.auth = {
        signupSuccess: false,
        error: authError.message,
        errorCode: 'EXCEPTION'
      };
    }

    // 4. Test de base de données
    try {
      const { data: testData, error: dbError } = await supabase
        .from('favorites')
        .select('count')
        .limit(1);

      diagnosis.database = {
        connectionSuccess: !dbError,
        error: dbError?.message || null,
        tableExists: !dbError || !dbError.message.includes('relation "favorites" does not exist')
      };
    } catch (dbConnError) {
      diagnosis.database = {
        connectionSuccess: false,
        error: dbConnError.message
      };
    }

    // 5. Recommandations
    if (!diagnosis.environment.hasUrl || !diagnosis.environment.hasAnonKey) {
      diagnosis.recommendations.push('🔧 Configurez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local');
    }

    if (diagnosis.environment.urlFormat === 'invalid') {
      diagnosis.recommendations.push('🔧 L\'URL Supabase doit commencer par https://');
    }

    if (!diagnosis.connection.success) {
      diagnosis.recommendations.push('🔧 Vérifiez que votre projet Supabase est actif et accessible');
    }

    if (!diagnosis.auth.signupSuccess) {
      if (diagnosis.auth.error?.includes('Database error')) {
        diagnosis.recommendations.push('🔧 Exécutez le script SQL de correction du schéma');
        diagnosis.recommendations.push('🔧 Vérifiez les politiques RLS dans Supabase Dashboard');
      }
      if (diagnosis.auth.error?.includes('signup disabled')) {
        diagnosis.recommendations.push('🔧 Activez les inscriptions dans Supabase Dashboard → Auth → Settings');
      }
    }

    if (!diagnosis.database.connectionSuccess) {
      diagnosis.recommendations.push('🔧 Vérifiez que les tables existent et que RLS est configuré');
    }

    return NextResponse.json(diagnosis);

  } catch (error) {
    diagnosis.recommendations.push('❌ Erreur générale: ' + error.message);
    return NextResponse.json(diagnosis, { status: 500 });
  }
} 