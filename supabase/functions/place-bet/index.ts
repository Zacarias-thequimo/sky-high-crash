import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlaceBetRequest {
  amount: number;
  round_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for secure operations
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

    const { amount, round_id }: PlaceBetRequest = await req.json();

    // Validate bet amount
    if (!amount || amount <= 0) {
      throw new Error('Invalid bet amount');
    }

    // Get user profile and check balance
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('balance, is_active')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    if (!profile.is_active) {
      throw new Error('Account is inactive');
    }

    if (profile.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Check if round is active
    const { data: round, error: roundError } = await supabaseAdmin
      .from('game_rounds')
      .select('is_active')
      .eq('id', round_id)
      .single();

    if (roundError || !round || !round.is_active) {
      throw new Error('Round is not active');
    }

    // Check if user already has a bet on this round
    const { data: existingBet } = await supabaseAdmin
      .from('bets')
      .select('id')
      .eq('user_id', user.id)
      .eq('round_id', round_id)
      .single();

    if (existingBet) {
      throw new Error('Bet already placed for this round');
    }

    // Start transaction: Update balance and create bet
    const { error: balanceError } = await supabaseAdmin.rpc('update_user_balance', {
      p_user_id: user.id,
      p_amount: amount,
      p_operation: 'subtract'
    });

    if (balanceError) {
      throw new Error('Failed to update balance');
    }

    // Create bet record
    const { data: bet, error: betError } = await supabaseAdmin
      .from('bets')
      .insert({
        user_id: user.id,
        round_id: round_id,
        amount: amount,
        potential_win: amount * 2, // Will be updated when cashing out
        status: 'active'
      })
      .select()
      .single();

    if (betError) {
      // Rollback balance update
      await supabaseAdmin.rpc('update_user_balance', {
        p_user_id: user.id,
        p_amount: amount,
        p_operation: 'add'
      });
      throw new Error('Failed to create bet');
    }

    // Create transaction record
    await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'bet',
        amount: amount,
        status: 'completed',
        description: `Bet placed on round ${round_id}`
      });

    // Log audit event
    await supabaseAdmin.rpc('log_audit_event', {
      p_user_id: user.id,
      p_action: 'place_bet',
      p_table_name: 'bets',
      p_record_id: bet.id,
      p_new_values: bet
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
        bet_id: bet.id,
        new_balance: updatedProfile?.balance || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Place bet error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});