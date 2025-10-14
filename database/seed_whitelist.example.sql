-- Seed file for email whitelist (EXAMPLE)
-- Copy this file to seed_whitelist.sql and replace emails with yours
-- The seed_whitelist.sql file is not versioned in Git for your security

-- Insert your authorized emails
INSERT INTO email_whitelist (email) VALUES 
    ('admin@example.com'),
    ('user1@example.com'),
    ('user2@example.com')
ON CONFLICT (email) DO NOTHING;

-- To execute this file from Supabase:
-- 1. Create a copy: cp seed_whitelist.example.sql seed_whitelist.sql
-- 2. Edit seed_whitelist.sql with your real emails
-- 3. Copy the content of seed_whitelist.sql
-- 4. Go to SQL Editor in your Supabase project
-- 5. Paste and execute the SQL
