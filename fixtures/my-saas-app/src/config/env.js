// Environment configuration for my-saas-app
module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://demo.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'anon-key-public-safe-demo',
  STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY || 'pk_test_sample',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_sample_valid_secret'
};
