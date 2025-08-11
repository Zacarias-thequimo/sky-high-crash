import { serve } from "https://deno.land/std@0.168.0/http/server.ts"; 
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DepositRequest {
  amount: number;
  phone?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error('Invalid authentication');

    const { amount, phone }: DepositRequest = await req.json();
    if (!amount || amount < 10) throw new Error('Minimum deposit amount is 10 MZN');
    if (amount > 100000) throw new Error('Maximum deposit amount is 100,000 MZN');

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) throw new Error('User profile not found');
    if (!profile.is_active) throw new Error('Account is inactive');

    // Criar registro de transação pendente
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'deposit',
        amount: amount,
        status: 'pending',
        payment_provider: 'gibrapay',
        description: `Deposit via Gibrapay - ${amount} MZN`,
        metadata: {
          phone: phone || profile.phone,
          request_time: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (transactionError) throw new Error('Failed to create transaction record');

    // Chamada oficial da API GibraPay (docs)
    const gibrapayApiKey = Deno.env.get('GIBRAPAY_API_KEY');
    const gibrapayWalletId = Deno.env.get('GIBRAPAY_WALLET_ID');

    if (!gibrapayApiKey || !gibrapayWalletId) {
      throw new Error('Gibrapay integration not configured');
    }

    const gibrapayRequest = await fetch("https://gibrapay.online/v1/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": gibrapayApiKey
      },
      body: JSON.stringify({
        wallet_id: gibrapayWalletId,
        amount: amount,
        number_phone: phone || profile.phone
      })
    });

    const gibrapayResponse = await gibrapayRequest.json();

    if (!gibrapayRequest.ok || gibrapayResponse.status !== 'success') {
      throw new Error(`Gibrapay transfer failed: ${JSON.stringify(gibrapayResponse)}`);
    }

    // Atualizar transação com dados externos
    await supabaseAdmin
      .from('transactions')
      .update({
        external_transaction_id: gibrapayResponse.transaction_id || null,
        status: 'processing',
        metadata: {
          ...transaction.metadata,
          gibrapay_response: gibrapayResponse
        }
      })
      .eq('id', transaction.id);

    await supabaseAdmin.rpc('log_audit_event', {
      p_user_id: user.id,
      p_action: 'deposit_initiated',
      p_table_name: 'transactions',
      p_record_id: transaction.id,
      p_new_values: { amount, provider: 'gibrapay' }
    });

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transaction.id,
        gibrapay_response: gibrapayResponse,
        amount: amount,
        message: 'Deposit initiated. Complete payment on Gibrapay.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Deposit error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
