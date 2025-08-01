-- Create enum types for better data integrity
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'bet', 'win', 'loss');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE public.bet_status AS ENUM ('active', 'won', 'lost', 'cancelled');
CREATE TYPE public.kyc_status AS ENUM ('pending', 'approved', 'rejected', 'not_submitted');

-- User profiles table with extended fields for betting
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  country TEXT,
  kyc_status kyc_status DEFAULT 'not_submitted',
  kyc_documents JSONB,
  balance DECIMAL(10,2) DEFAULT 0.00 CHECK (balance >= 0),
  total_deposited DECIMAL(10,2) DEFAULT 0.00,
  total_withdrawn DECIMAL(10,2) DEFAULT 0.00,
  total_bet DECIMAL(10,2) DEFAULT 0.00,
  total_won DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transactions table for all financial operations
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  status transaction_status DEFAULT 'pending',
  payment_provider TEXT,
  external_transaction_id TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Game rounds table
CREATE TABLE public.game_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  multiplier DECIMAL(8,2) NOT NULL CHECK (multiplier >= 1.00),
  crashed_at TIMESTAMPTZ DEFAULT now(),
  seed_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bets table
CREATE TABLE public.bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES public.game_rounds(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  cash_out_multiplier DECIMAL(8,2),
  potential_win DECIMAL(10,2),
  actual_win DECIMAL(10,2) DEFAULT 0.00,
  status bet_status DEFAULT 'active',
  placed_at TIMESTAMPTZ DEFAULT now(),
  cashed_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit logs for compliance
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update transactions" ON public.transactions
  FOR UPDATE USING (true);

-- RLS Policies for game_rounds
CREATE POLICY "Anyone can view game rounds" ON public.game_rounds
  FOR SELECT USING (true);

CREATE POLICY "System can manage game rounds" ON public.game_rounds
  FOR ALL USING (true);

-- RLS Policies for bets
CREATE POLICY "Users can view own bets" ON public.bets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bets" ON public.bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update bets" ON public.bets
  FOR UPDATE USING (true);

-- RLS Policies for audit_logs (admin only)
CREATE POLICY "Admin can view audit logs" ON public.audit_logs
  FOR SELECT USING (false); -- Only accessible via service role

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX idx_bets_user_id ON public.bets(user_id);
CREATE INDEX idx_bets_round_id ON public.bets(round_id);
CREATE INDEX idx_bets_status ON public.bets(status);
CREATE INDEX idx_game_rounds_is_active ON public.game_rounds(is_active);

-- Function to handle new user registration
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update balance
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit events
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
$$ LANGUAGE plpgsql SECURITY DEFINER;