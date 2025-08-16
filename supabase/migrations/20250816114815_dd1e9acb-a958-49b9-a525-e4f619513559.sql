-- Create function to get last 20 game rounds
CREATE OR REPLACE FUNCTION public.get_recent_game_rounds()
RETURNS TABLE (
  id UUID,
  multiplier DECIMAL(10,2),
  crashed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    gr.id,
    gr.multiplier,
    gr.crashed_at,
    gr.created_at
  FROM public.game_rounds gr
  ORDER BY gr.created_at DESC
  LIMIT 20;
END;
$function$;