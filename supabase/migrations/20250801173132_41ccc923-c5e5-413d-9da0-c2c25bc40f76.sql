-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.update_user_balance(
  p_user_id UUID,
  p_amount DECIMAL(10,2),
  p_operation TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance DECIMAL(10,2);
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance 
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- Check if user exists
  IF current_balance IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if withdrawal would cause negative balance
  IF p_operation = 'subtract' AND current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Update balance
  IF p_operation = 'add' THEN
    UPDATE public.profiles 
    SET balance = balance + p_amount, 
        updated_at = now()
    WHERE id = p_user_id;
  ELSIF p_operation = 'subtract' THEN
    UPDATE public.profiles 
    SET balance = balance - p_amount, 
        updated_at = now()
    WHERE id = p_user_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_table_name TEXT DEFAULT NULL,
  p_record_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action, table_name, record_id, 
    old_values, new_values
  ) VALUES (
    p_user_id, p_action, p_table_name, p_record_id,
    p_old_values, p_new_values
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';