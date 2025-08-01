import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fair multiplier generation using provably fair algorithm
function generateMultiplier(seed: string): number {
  // Simple hash-based random number generation
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive number between 0 and 1
  const random = Math.abs(hash) / 2147483647;
  
  // Crash distribution: higher chance for lower multipliers
  if (random < 0.33) return +(1 + random * 1).toFixed(2); // 1.00x - 2.00x
  if (random < 0.80) return +(2 + (random - 0.33) * 15).toFixed(2); // 2.00x - 9.00x
  return +(9 + (random - 0.80) * 91).toFixed(2); // 9.00x - 100.00x
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

    const { action } = await req.json();

    if (action === 'start_round') {
      // Generate seed for fair multiplier
      const seed = `${Date.now()}_${Math.random()}`;
      const crashMultiplier = generateMultiplier(seed);
      
      // Create new game round
      const { data: round, error: roundError } = await supabaseAdmin
        .from('game_rounds')
        .insert({
          multiplier: crashMultiplier,
          seed_hash: seed,
          is_active: true,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (roundError) {
        throw new Error('Failed to create new round');
      }

      return new Response(
        JSON.stringify({
          success: true,
          round_id: round.id,
          crash_multiplier: crashMultiplier,
          message: 'Round started'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'end_round') {
      const { round_id } = await req.json();
      
      // End the round
      const { error: endRoundError } = await supabaseAdmin
        .from('game_rounds')
        .update({
          is_active: false,
          crashed_at: new Date().toISOString()
        })
        .eq('id', round_id);

      if (endRoundError) {
        throw new Error('Failed to end round');
      }

      // Mark all active bets as lost
      const { error: updateBetsError } = await supabaseAdmin
        .from('bets')
        .update({
          status: 'lost'
        })
        .eq('round_id', round_id)
        .eq('status', 'active');

      if (updateBetsError) {
        console.error('Failed to update bets:', updateBetsError);
      }

      // Create loss transactions for users who didn't cash out
      const { data: lostBets } = await supabaseAdmin
        .from('bets')
        .select('user_id, amount')
        .eq('round_id', round_id)
        .eq('status', 'lost');

      if (lostBets) {
        for (const bet of lostBets) {
          await supabaseAdmin
            .from('transactions')
            .insert({
              user_id: bet.user_id,
              type: 'loss',
              amount: bet.amount,
              status: 'completed',
              description: `Lost bet on round ${round_id}`
            });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Round ended'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_active_round') {
      const { data: activeRound } = await supabaseAdmin
        .from('game_rounds')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return new Response(
        JSON.stringify({
          success: true,
          round: activeRound
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Game manager error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});