# Database - Migrations and Seeds

## Structure

```
database/
├── db_schema.sql                      # Complete database schema
├── migrations/                        # SQL migrations (versioned in Git)
│   ├── create_email_whitelist.sql
│   ├── create_email_whitelist_fixed.sql
│   ├── fix_email_whitelist_permissions.sql
│   └── ...
├── seed_whitelist.example.sql        # Seed example (versioned in Git)
└── seed_whitelist.sql                # Your real emails (NOT versioned)
```

## Initial setup

### 1. Create your personal seed file

```bash
cd database
cp seed_whitelist.example.sql seed_whitelist.sql
```

### 2. Edit the file with your real emails

Edit `seed_whitelist.sql` and replace example emails with yours:

```sql
INSERT INTO email_whitelist (email) VALUES
    ('your.email@example.com'),
    ('another.email@example.com')
ON CONFLICT (email) DO NOTHING;
```

### 3. Run migrations in Supabase

1. Go to your Supabase project
2. Open the **SQL Editor**
3. Copy the content of each migration file
4. Execute them in order

### 4. Run the seed

1. Open your `seed_whitelist.sql` file (not the `.example`)
2. Copy the content
3. Paste in Supabase SQL Editor
4. Execute

## Security

⚠️ **IMPORTANT**: The `seed_whitelist.sql` file contains your personal emails and **is not versioned in Git** thanks to `.gitignore`.

Migrations in the `migrations/` folder only contain example data and can be safely versioned.

## Adding new emails

You can add new emails via your application's admin interface or directly in Supabase SQL Editor:

```sql
INSERT INTO email_whitelist (email) VALUES ('new.email@example.com')
ON CONFLICT (email) DO NOTHING;
```
