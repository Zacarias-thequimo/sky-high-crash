-- Update function to support phone-based signups and avoid NULL email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, CONCAT(NEW.phone, '@phone.local')),
    COALESCE(NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.email, NEW.phone)),
    NEW.phone
  );
  RETURN NEW;
END;
$function$;

-- Ensure trigger exists to populate profiles on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();