-- Create game_rounds table to store server-side game history
CREATE TABLE IF NOT EXISTS public.game_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  multiplier DECIMAL(10,2) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'crashed', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;

-- Create policy for everyone to read game rounds (public data)
CREATE POLICY "Game rounds are viewable by everyone" 
ON public.game_rounds 
FOR SELECT 
USING (true);

-- Create policy for system to insert game rounds
CREATE POLICY "System can insert game rounds" 
ON public.game_rounds 
FOR INSERT 
WITH CHECK (true);

-- Create policy for system to update game rounds
CREATE POLICY "System can update game rounds" 
ON public.game_rounds 
FOR UPDATE 
USING (true);

-- Create index for better performance
CREATE INDEX idx_game_rounds_created_at ON public.game_rounds(created_at DESC);

-- Create function to get last 20 game rounds
CREATE OR REPLACE FUNCTION public.get_recent_game_rounds()
RETURNS TABLE (
  id UUID,
  multiplier DECIMAL(10,2),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT,
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
    gr.start_time,
    gr.end_time,
    gr.status,
    gr.created_at
  FROM public.game_rounds gr
  WHERE gr.status = 'completed'
  ORDER BY gr.created_at DESC
  LIMIT 20;
END;
$function$

-- Create function to add new game round
CREATE OR REPLACE FUNCTION public.add_game_round(p_multiplier DECIMAL(10,2))
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  round_id UUID;
BEGIN
  INSERT INTO public.game_rounds (multiplier, status)
  VALUES (p_multiplier, 'completed')
  RETURNING id INTO round_id;
  
  RETURN round_id;
END;
$function$