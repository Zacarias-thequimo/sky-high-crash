import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CashOutRequest {
  bet_id: string;
  multiplier: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { bet_id, multiplier }: CashOutRequest = await req.json();

    // Validate multiplier
    if (!multiplier || multiplier < 1) {
      throw new Error('Invalid multiplier');
    }

    // Get bet details
    const { data: bet, error: betError } = await supabaseAdmin
      .from('bets')
      .select('*, game_rounds!inner(is_active, multiplier)')
      .eq('id', bet_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (betError || !bet) {
      throw new Error('Bet not found or already cashed out');
    }

    // Check if round is still active
    if (!bet.game_rounds.is_active) {
      throw new Error('Round has ended');
    }

    // Calculate winnings
    const winAmount = bet.amount * multiplier;
    const profit = winAmount - bet.amount;

    // Update bet status
    const { error: updateBetError } = await supabaseAdmin
      .from('bets')
      .update({
        status: 'won',
        cash_out_multiplier: multiplier,
        actual_win: winAmount,
        cashed_out_at: new Date().toISOString()
      })
      .eq('id', bet_id);

    if (updateBetError) {
      throw new Error('Failed to update bet');
    }

    // Add winnings to user balance
    const { error: balanceError } = await supabaseAdmin.rpc('update_user_balance', {
      p_user_id: user.id,
      p_amount: winAmount,
      p_operation: 'add'
    });

    if (balanceError) {
      throw new Error('Failed to update balance');
    }

    // Update user statistics
    await supabaseAdmin
      .from('profiles')
      .update({
        total_won: supabaseAdmin.sql`total_won + ${winAmount}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    // Create win transaction record
    await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'win',
        amount: winAmount,
        status: 'completed',
        description: `Cash out at ${multiplier}x multiplier`
      });

    // Log audit event
    await supabaseAdmin.rpc('log_audit_event', {
      p_user_id: user.id,
      p_action: 'cash_out',
      p_table_name: 'bets',
      p_record_id: bet_id,
      p_new_values: { multiplier, win_amount: winAmount }
    });

    // Get updated profile
    const { data: updatedProfile } = await supabaseAdmin
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        win_amount: winAmount,
        profit: profit,
        new_balance: updatedProfile?.balance || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Cash out error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});