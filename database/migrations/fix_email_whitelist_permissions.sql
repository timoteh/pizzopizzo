-- Drop old restrictive policy
DROP POLICY IF EXISTS "Restrict modifications to email_whitelist" ON email_whitelist;

-- Create more granular policies

-- Policy to allow read access to all (necessary to verify authorization)
DROP POLICY IF EXISTS "Allow read access to email_whitelist" ON email_whitelist;
CREATE POLICY "Allow read access to email_whitelist" ON email_whitelist
    FOR SELECT USING (true);

-- Policy to allow inserts for authenticated users
CREATE POLICY "Allow insert for authenticated users" ON email_whitelist
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow updates for authenticated users
CREATE POLICY "Allow update for authenticated users" ON email_whitelist
    FOR UPDATE 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow deletes for authenticated users
CREATE POLICY "Allow delete for authenticated users" ON email_whitelist
    FOR DELETE 
    USING (auth.uid() IS NOT NULL);

-- More restrictive alternative: allow only a specific admin
-- Uncomment these lines and comment the previous ones if you want to restrict to your email only
-- Replace 'your-admin@example.com' with your actual admin email

-- CREATE POLICY "Allow insert for admin only" ON email_whitelist
--     FOR INSERT 
--     WITH CHECK (
--         auth.uid() IS NOT NULL AND 
--         auth.jwt() ->> 'email' = 'your-admin@example.com'
--     );

-- CREATE POLICY "Allow update for admin only" ON email_whitelist
--     FOR UPDATE 
--     USING (
--         auth.uid() IS NOT NULL AND 
--         auth.jwt() ->> 'email' = 'your-admin@example.com'
--     )
--     WITH CHECK (
--         auth.uid() IS NOT NULL AND 
--         auth.jwt() ->> 'email' = 'your-admin@example.com'
--     );

-- CREATE POLICY "Allow delete for admin only" ON email_whitelist
--     FOR DELETE 
--     USING (
--         auth.uid() IS NOT NULL AND 
--         auth.jwt() ->> 'email' = 'your-admin@example.com'
--     );
