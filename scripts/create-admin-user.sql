-- Create the default admin user Jose
INSERT INTO users (id, email, password, name, role, "messageLimit", "isActive", "createdAt", "updatedAt")
VALUES (
  'admin-jose-001',
  'jose@admin.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', -- hashed 'admin123'
  'Jose',
  'SUPER_ADMIN',
  1000,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Update existing users to have proper password field (if migrating)
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
