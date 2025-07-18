# Environment Setup Guide

## Quick Start

1. **Copy the example environment file:**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. **Fill in your values in `.env.local`:**
   - Set your PostgreSQL database URL
   - Add your OpenRouter API key (already provided)
   - Generate secure JWT secrets
   - Configure other optional settings

## Environment Variables Explained

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `OPENROUTER_API_KEY` | Your OpenRouter API key | `sk-or-v1-...` |
| `JWT_SECRET` | Secret for JWT token signing | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_SECRET` | NextAuth.js secret | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your application URL | `http://localhost:3000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEFAULT_ADMIN_EMAIL` | Admin user email | `jose@admin.com` |
| `DEFAULT_ADMIN_PASSWORD` | Admin user password | `admin123` |
| `RATE_LIMIT_MAX_REQUESTS` | API rate limit | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |

## Database Setup

### Local PostgreSQL
\`\`\`bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt install postgresql  # Ubuntu

# Create database
createdb galaxy_chat

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/galaxy_chat"
\`\`\`

### Using Supabase
\`\`\`bash
# Create project at https://supabase.com
# Get connection string from Settings > Database
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
\`\`\`

### Using Neon
\`\`\`bash
# Create project at https://neon.tech
# Get connection string from dashboard
DATABASE_URL="postgresql://[user]:[password]@[endpoint]/[dbname]"
\`\`\`

## Security Best Practices

### JWT Secrets
Generate strong secrets:
\`\`\`bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate NEXTAUTH_SECRET
openssl rand -base64 32
\`\`\`

### Production Environment
- Use different secrets for production
- Enable HTTPS in production
- Set secure cookie settings
- Use environment-specific database

## Development vs Production

### Development (.env.local)
\`\`\`env
NODE_ENV="development"
NEXTAUTH_URL="http://localhost:3000"
DATABASE_URL="postgresql://localhost:5432/galaxy_chat_dev"
\`\`\`

### Production (.env.production)
\`\`\`env
NODE_ENV="production"
NEXTAUTH_URL="https://your-domain.com"
DATABASE_URL="postgresql://prod-host:5432/galaxy_chat_prod"
SECURE_COOKIES="true"
\`\`\`

## Docker Setup

Use the provided `docker-compose.yml`:
\`\`\`bash
# Start with Docker
docker-compose up -d

# The app will be available at http://localhost:3000
# PostgreSQL will be available at localhost:5432
\`\`\`

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check connection string format
- Ensure database exists
- Check firewall settings

### Authentication Issues
- Verify JWT_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Ensure secrets are at least 32 characters

### API Issues
- Verify OPENROUTER_API_KEY is correct
- Check API key permissions
- Monitor rate limits

## Environment File Priority

Next.js loads environment variables in this order:
1. `.env.local` (always loaded, ignored by git)
2. `.env.development` or `.env.production`
3. `.env`

## Security Notes

- Never commit `.env.local` or `.env.production` to git
- Use different secrets for each environment
- Rotate secrets regularly
- Monitor for exposed keys in logs
