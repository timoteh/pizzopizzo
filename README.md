# 🍕 Pizzo Pizzo - Pizza Reservation System

Modern web application for pizza reservations with secure payment and administrative management.

## ✨ Features

- 🎯 **Time Slot Reservations** - Weekly slot system for pickups
- 💳 **Secure Payment** - Stripe integration for online payments
- 🔐 **Google Authentication** - Login via Supabase Auth
- 👥 **Whitelist System** - Access controlled by authorized email list
- 📊 **Admin Interface** - Reservation and whitelist management
- 📱 **Responsive Design** - Modern and mobile-friendly interface
- 🎨 **Polished UI/UX** - Smooth animations and optimized user experience

## 🛠️ Technologies

- **Frontend**: [SvelteKit](https://kit.svelte.dev/) + TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.x
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth)
- **Payment**: [Stripe](https://stripe.com/)
- **Icons**: [Lucide](https://lucide.dev/)
- **Deployment**: Vercel (adapter included)

## 📋 Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)
- [Supabase](https://supabase.com/) account (free tier available)
- [Stripe](https://stripe.com/) account (free in test mode)
- Google Cloud account (for OAuth)

## 🚀 Installation

### 1. Clone the project

```bash
git clone <your-repo>
cd pizzopizzo
```

### 2. Install dependencies

```bash
pnpm install
# or npm install
```

### 3. Environment variables configuration

Create a `.env` file at the project root:

```bash
cp .env.example .env
```

Edit `.env` and fill in your keys:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_STRIPE_SECRET_KEY=sk_test_xxxxx

# Admin Email
ADMIN_EMAIL=your-email@example.com
```

> ⚠️ **Important**: Never commit the `.env` file! It's already in `.gitignore`.

### 4. Database configuration

#### a) Create Supabase project

1. Go to [supabase.com](https://supabase.com/)
2. Create a new project
3. Get the URL and anon key from project settings

#### b) Run migrations

1. Open the **SQL Editor** in your Supabase dashboard
2. Execute migrations in order:
   - `database/db_schema.sql` - Main schema
   - `database/migrations/create_email_whitelist_fixed.sql` - Whitelist table
   - `database/migrations/fix_email_whitelist_permissions.sql` - RLS permissions
   - `database/migrations/add_*.sql` - Other migrations

#### c) Configure whitelist

```bash
# Create your personal seed file
cd database
cp seed_whitelist.example.sql seed_whitelist.sql
```

Edit `seed_whitelist.sql` with your authorized emails, then execute it in Supabase SQL Editor.

> 📖 See `database/README.md` for more details.

### 5. Google OAuth configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create an OAuth 2.0 project
3. Configure redirect URLs:
   - `https://<your-project-id>.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret
5. Add them in Supabase: **Authentication** > **Providers** > **Google**

### 6. Stripe configuration

1. Create an account on [Stripe](https://stripe.com/)
2. Get your API keys in **Test** mode
3. Configure webhooks (optional for production)

## 💻 Development

Start the development server:

```bash
pnpm dev
# or npm run dev

# To automatically open the browser
pnpm dev -- --open
```

The application will be available at `http://localhost:5173`

### Available scripts

```bash
pnpm dev          # Development server
pnpm build        # Production build
pnpm preview      # Preview build
pnpm check        # TypeScript check
pnpm lint         # ESLint linter
pnpm format       # Format with Prettier
pnpm test         # Unit tests
```

## 📦 Build and deployment

### Production build

```bash
pnpm build
```

### Deploy on Vercel

The project is configured with `@sveltejs/adapter-vercel`:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel for automatic deployment.

> ⚠️ Don't forget to configure environment variables in Vercel settings!

## 📁 Project structure

```
pizzopizzo/
├── database/              # SQL migrations and seeds
│   ├── migrations/        # Versioned migrations
│   ├── seed_whitelist.sql # Your emails (not versioned)
│   └── README.md
├── src/
│   ├── lib/
│   │   ├── components/    # Svelte components
│   │   ├── stores/        # Svelte stores
│   │   ├── utils/         # Utilities
│   │   ├── stripe.ts      # Stripe configuration
│   │   ├── supabase.ts    # Supabase configuration
│   │   └── types.ts       # TypeScript types
│   └── routes/            # Pages and API routes
│       ├── +page.svelte   # Home page
│       ├── admin/         # Admin interface
│       ├── api/           # API endpoints
│       └── ...
├── static/                # Static assets
├── .env                   # Environment variables (not versioned)
├── .env.example           # Environment variables template
└── README.md
```

## 🔒 Security and private data

### Sensitive files (NOT versioned)

- `.env` - Environment variables and API keys
- `database/seed_whitelist.sql` - List of authorized emails

### Collected data

The application collects and stores:

- First and last names
- Email addresses
- Phone numbers
- Reservation information

**Banking information is NEVER stored** - it's handled securely by Stripe.

### Row Level Security (RLS)

The database uses Supabase's RLS (Row Level Security) to protect data:

- Unauthenticated users can only check their whitelist access
- Whitelist modifications require authentication
- Reservations are protected by RLS policies

## 🐛 Debugging

### Common issues

**"Stripe could not be initialized"**

- Check that `VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY` is defined in `.env`

**"Error connecting to Supabase"**

- Check URL and anon key in `.env`
- Verify RLS is properly configured

**"Email not whitelisted"**

- Add your email via admin interface or SQL Editor

---

Built with ❤️ and 🍕
