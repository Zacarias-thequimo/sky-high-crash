-- Criar profiles para usuários antigos que não têm profile ainda
INSERT INTO public.profiles (id, email, full_name, phone)
SELECT 
  au.id,
  COALESCE(au.email, CONCAT(au.phone, '@phone.local')),
  COALESCE(au.raw_user_meta_data->>'full_name', COALESCE(au.email, au.phone)),
  au.phone
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
);