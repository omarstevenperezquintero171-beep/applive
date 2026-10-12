import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface StripeSessionData {
  id?: string;
  amount_total?: number;
  amount?: number;
  client_reference_id?: string;
  metadata?: {
    userId?: string;
    creditsToAdd?: string | number;
  };
}

interface StripeWebhookEvent {
  type: string;
  data?: {
    object?: StripeSessionData;
  };
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let event: StripeWebhookEvent;

    try {
      event = JSON.parse(rawBody) as StripeWebhookEvent;
    } catch {
      return NextResponse.json({ error: 'Payload de webhook inválido' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Manejar eventos de Stripe: checkout.session.completed o payment_intent.succeeded
    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
      const session = event.data?.object;
      const userId = session?.metadata?.userId || session?.client_reference_id;
      const creditsToAdd = Number(session?.metadata?.creditsToAdd || 50);
      const amount = (session?.amount_total || session?.amount || 0) / 100;

      if (userId) {
        // Registrar en tabla transactions
        await supabase.from('transactions').insert({
          id: `stripe_${session.id || Date.now()}`,
          user_id: userId,
          amount: amount,
          credits_added: creditsToAdd,
          payment_status: 'completed',
          payment_provider: 'stripe',
          provider_tx_id: session.id,
        });

        // Incrementar saldo de créditos en la tabla profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits_remaining')
          .eq('id', userId)
          .single();

        const currentCredits = profile?.credits_remaining ?? 0;
        await supabase
          .from('profiles')
          .update({
            credits_remaining: currentCredits + creditsToAdd,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json({ error: 'Error procesando webhook', details: message }, { status: 500 });
  }
}
