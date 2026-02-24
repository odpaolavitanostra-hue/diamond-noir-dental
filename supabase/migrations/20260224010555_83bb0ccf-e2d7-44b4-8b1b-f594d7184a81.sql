
-- Allow authenticated users to insert their own admin role
CREATE POLICY "Users can insert own role" 
ON public.user_roles 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow updating settings for authenticated users
CREATE POLICY "Auth can insert settings" 
ON public.settings 
FOR INSERT TO authenticated 
WITH CHECK (true);
