-- Create admin system with user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role public.user_role DEFAULT 'user' NOT NULL;

-- Create admin_actions table for logging admin activities
CREATE TABLE public.admin_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  target_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount numeric,
  description text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin_actions
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_actions
CREATE POLICY "Admins can view all admin actions" 
ON public.admin_actions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can insert admin actions" 
ON public.admin_actions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) AND admin_id = auth.uid()
);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;