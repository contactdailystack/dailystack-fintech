-- Create subscription_templates table
CREATE TABLE IF NOT EXISTS subscription_templates (
  id serial PRIMARY KEY,
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  default_amount numeric(10,2) DEFAULT 0,
  category text,
  created_at timestamptz DEFAULT now()
);
