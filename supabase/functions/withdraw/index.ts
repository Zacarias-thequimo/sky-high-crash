import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WithdrawRequest {
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

    const { amount, phone }: WithdrawRequest = await req.json();
    
    // Validações
    if (!amount || amount < 100) throw new Error('Minimum withdrawal amount is 100 MZN');
    if (amount > 50000) throw new Error('Maximum withdrawal amount is 50,000 MZN');

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) throw new Error('User profile not found');
    if (!profile.is_active) throw new Error('Account is inactive');
    if (profile.balance < amount) throw new Error('Insufficient balance');

    // Criar registro de transação de levantamento
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'withdrawal',
        amount: amount,
        status: 'pending',
        payment_provider: 'gibrapay',
        description: `Withdrawal via Gibrapay - ${amount} MZN`,
        metadata: {
          phone: phone || profile.phone,
          request_time: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (transactionError) throw new Error('Failed to create withdrawal record');

    // Deduzir do saldo imediatamente (será revertido se a transferência falhar)
    const balanceUpdated = await supabaseAdmin.rpc('update_user_balance', {
      p_user_id: user.id,
      p_amount: amount,
      p_operation: 'subtract'
    });

    if (!balanceUpdated) {
      // Reverter transação se falha na atualização do saldo
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'failed', metadata: { ...transaction.metadata, error: 'Balance update failed' } })
        .eq('id', transaction.id);
      throw new Error('Failed to update balance');
    }

    // Chamada para API GibraPay para processar levantamento
    const gibrapayApiKey = Deno.env.get('GIBRAPAY_API_KEY');
    const gibrapayWalletId = Deno.env.get('GIBRAPAY_WALLET_ID');

    if (!gibrapayApiKey || !gibrapayWalletId) {
      // Reverter saldo se configuração não disponível
      await supabaseAdmin.rpc('update_user_balance', {
        p_user_id: user.id,
        p_amount: amount,
        p_operation: 'add'
      });
      
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'failed', metadata: { ...transaction.metadata, error: 'Payment gateway not configured' } })
        .eq('id', transaction.id);
      
      throw new Error('Withdrawal service temporarily unavailable');
    }

    try {
      const gibrapayRequest = await fetch("https://gibrapay.online/v1/withdraw", {
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
        // Reverter saldo em caso de falha na transferência
        await supabaseAdmin.rpc('update_user_balance', {
          p_user_id: user.id,
          p_amount: amount,
          p_operation: 'add'
        });

        await supabaseAdmin
          .from('transactions')
          .update({
            status: 'failed',
            metadata: {
              ...transaction.metadata,
              gibrapay_response: gibrapayResponse,
              error: 'Gibrapay withdrawal failed'
            }
          })
          .eq('id', transaction.id);

        throw new Error(`Withdrawal failed: ${gibrapayResponse.message || 'Unknown error'}`);
      }

      // Atualizar transação com sucesso
      await supabaseAdmin
        .from('transactions')
        .update({
          external_transaction_id: gibrapayResponse.transaction_id || null,
          status: 'completed',
          metadata: {
            ...transaction.metadata,
            gibrapay_response: gibrapayResponse
          }
        })
        .eq('id', transaction.id);

    } catch (error) {
      console.error('Gibrapay API error:', error);
      
      // Reverter saldo em caso de erro
      await supabaseAdmin.rpc('update_user_balance', {
        p_user_id: user.id,
        p_amount: amount,
        p_operation: 'add'
      });

      await supabaseAdmin
        .from('transactions')
        .update({
          status: 'failed',
          metadata: {
            ...transaction.metadata,
            error: 'API communication failed'
          }
        })
        .eq('id', transaction.id);

      throw new Error('Withdrawal request failed. Please try again later.');
    }

    await supabaseAdmin.rpc('log_audit_event', {
      p_user_id: user.id,
      p_action: 'withdrawal_completed',
      p_table_name: 'transactions',
      p_record_id: transaction.id,
      p_new_values: { amount, provider: 'gibrapay' }
    });

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transaction.id,
        amount: amount,
        message: 'Withdrawal processed successfully. Funds will be transferred shortly.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Withdrawal error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});