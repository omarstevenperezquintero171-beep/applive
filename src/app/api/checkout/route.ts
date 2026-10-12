import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, itemId, amount, creditsToAdd, provider } = body;

    if (!userId || !amount || !creditsToAdd) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos para el checkout' },
        { status: 400 }
      );
    }

    // Inicializar cliente de Supabase con SUPABASE_SECRET_KEY para bypass de RLS administrativo
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Registrar la transacción
    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const { error: txError } = await supabase.from('transactions').insert({
      id: txId,
      user_id: userId,
      amount: Number(amount),
      credits_added: Number(creditsToAdd),
      payment_status: 'completed',
      payment_provider: provider || 'stripe',
      plan_id: itemId || null,
    });

    if (txError) {
      console.error('Error insertando transacción:', txError);
    }

    // 2. Incrementar los créditos del usuario en la tabla profiles
    const { data: profile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('credits_remaining, plan_tier')
      .eq('id', userId)
      .single();

    if (profileFetchError) {
      console.error('Error obteniendo perfil:', profileFetchError);
    }

    const currentCredits = profile?.credits_remaining ?? 0;
    const newTotal = currentCredits + Number(creditsToAdd);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        credits_remaining: newTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error actualizando créditos:', updateError);
      return NextResponse.json(
        { error: 'No se pudo actualizar los créditos en la base de datos' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transactionId: txId,
      creditsAdded: creditsToAdd,
      newCreditsTotal: newTotal,
      message: `Se han acreditado +${creditsToAdd} créditos con éxito.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error interno del servidor', details: message },
      { status: 500 }
    );
  }
}
