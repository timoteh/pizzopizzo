-- Create table for email whitelist
CREATE TABLE IF NOT EXISTS email_whitelist (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE
);

-- Insert initial authorized emails (examples)
-- To add your emails, use the seed_whitelist.sql file (not versioned)
INSERT INTO email_whitelist (email) VALUES 
    ('admin@example.com')
ON CONFLICT (email) DO NOTHING;

-- Index to improve search performance
CREATE INDEX IF NOT EXISTS idx_email_whitelist_email ON email_whitelist(email);
CREATE INDEX IF NOT EXISTS idx_email_whitelist_active ON email_whitelist(active);

-- RLS (Row Level Security) to secure access
ALTER TABLE email_whitelist ENABLE ROW LEVEL SECURITY;

-- Policy to allow read access to all (necessary to verify authorization)
CREATE POLICY "Allow read access to email_whitelist" ON email_whitelist
    FOR SELECT USING (true);

-- Policy to prevent unauthorized modifications
CREATE POLICY "Restrict modifications to email_whitelist" ON email_whitelist
    FOR ALL USING (false);
