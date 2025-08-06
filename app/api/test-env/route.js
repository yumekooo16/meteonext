import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envCheck = {
      supabase: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        urlFormat: process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') ? 'valid' : 'invalid',
        anonKeyFormat: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ') ? 'valid' : 'invalid',
        serviceRoleFormat: process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ') ? 'valid' : 'invalid'
      },
      stripe: {
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        secretKeyFormat: process.env.STRIPE_SECRET_KEY?.startsWith('sk_') ? 'valid' : 'invalid',
        publishableKeyFormat: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_') ? 'valid' : 'invalid',
        webhookSecretFormat: process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_') ? 'valid' : 'invalid'
      },
      weather: {
        hasApiKey: !!process.env.NEXT_PUBLIC_WEATHER_API_KEY,
        apiKeyLength: process.env.NEXT_PUBLIC_WEATHER_API_KEY?.length || 0
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'not_set',
        vercelUrl: process.env.VERCEL_URL || 'not_set'
      }
    };

    // Calculer le score de configuration
    const totalChecks = 12; // Nombre total de vérifications
    let passedChecks = 0;

    // Vérifications Supabase
    if (envCheck.supabase.hasUrl) passedChecks++;
    if (envCheck.supabase.hasAnonKey) passedChecks++;
    if (envCheck.supabase.hasServiceRoleKey) passedChecks++;
    if (envCheck.supabase.urlFormat === 'valid') passedChecks++;
    if (envCheck.supabase.anonKeyFormat === 'valid') passedChecks++;
    if (envCheck.supabase.serviceRoleFormat === 'valid') passedChecks++;

    // Vérifications Stripe
    if (envCheck.stripe.hasSecretKey) passedChecks++;
    if (envCheck.stripe.hasPublishableKey) passedChecks++;
    if (envCheck.stripe.hasWebhookSecret) passedChecks++;
    if (envCheck.stripe.secretKeyFormat === 'valid') passedChecks++;
    if (envCheck.stripe.publishableKeyFormat === 'valid') passedChecks++;
    if (envCheck.stripe.webhookSecretFormat === 'valid') passedChecks++;

    const configurationScore = Math.round((passedChecks / totalChecks) * 100);

    // Déterminer le statut
    let status = 'error';
    if (configurationScore >= 90) status = 'success';
    else if (configurationScore >= 70) status = 'warning';
    else status = 'error';

    // Générer des recommandations
    const recommendations = [];

    if (!envCheck.supabase.hasUrl) {
      recommendations.push('🔧 Configurez NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!envCheck.supabase.hasAnonKey) {
      recommendations.push('🔧 Configurez NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    if (!envCheck.supabase.hasServiceRoleKey) {
      recommendations.push('🔧 Configurez SUPABASE_SERVICE_ROLE_KEY');
    }
    if (envCheck.supabase.urlFormat === 'invalid') {
      recommendations.push('🔧 L\'URL Supabase doit commencer par https://');
    }
    if (envCheck.supabase.anonKeyFormat === 'invalid') {
      recommendations.push('🔧 La clé anonyme Supabase doit commencer par eyJ...');
    }
    if (envCheck.supabase.serviceRoleFormat === 'invalid') {
      recommendations.push('🔧 La clé service role Supabase doit commencer par eyJ...');
    }

    if (!envCheck.stripe.hasSecretKey) {
      recommendations.push('🔧 Configurez STRIPE_SECRET_KEY');
    }
    if (!envCheck.stripe.hasPublishableKey) {
      recommendations.push('🔧 Configurez NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
    }
    if (!envCheck.stripe.hasWebhookSecret) {
      recommendations.push('🔧 Configurez STRIPE_WEBHOOK_SECRET');
    }
    if (envCheck.stripe.secretKeyFormat === 'invalid') {
      recommendations.push('🔧 La clé secrète Stripe doit commencer par sk_...');
    }
    if (envCheck.stripe.publishableKeyFormat === 'invalid') {
      recommendations.push('🔧 La clé publique Stripe doit commencer par pk_...');
    }
    if (envCheck.stripe.webhookSecretFormat === 'invalid') {
      recommendations.push('🔧 La clé webhook Stripe doit commencer par whsec_...');
    }

    if (!envCheck.weather.hasApiKey) {
      recommendations.push('🔧 Configurez NEXT_PUBLIC_WEATHER_API_KEY');
    }

    return NextResponse.json({
      status,
      configurationScore,
      envCheck,
      recommendations,
      summary: {
        totalChecks,
        passedChecks,
        failedChecks: totalChecks - passedChecks
      },
      message: configurationScore === 100 
        ? '✅ Configuration parfaite ! Toutes les variables sont correctement configurées.'
        : configurationScore >= 70
        ? '⚠️ Configuration partielle. Vérifiez les recommandations ci-dessous.'
        : '❌ Configuration incomplète. Suivez les recommandations pour corriger les problèmes.'
    });

  } catch (error) {
    console.error('❌ Erreur lors du test de configuration:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Erreur lors du test de configuration',
        details: error.message
      },
      { status: 500 }
    );
  }
} 