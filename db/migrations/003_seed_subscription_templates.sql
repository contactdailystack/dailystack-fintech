-- Seed subscription templates used by quick-add
INSERT INTO subscription_templates (key, name, default_amount, category)
VALUES
  ('netflix', 'Netflix', 329.00, 'Entertainment'),
  ('spotify', 'Spotify', 129.00, 'Entertainment'),
  ('youtube_premium', 'YouTube Premium', 159.00, 'Entertainment'),
  ('chatgpt_plus', 'ChatGPT Plus', 20.00, 'Tools'),
  ('adobe', 'Adobe Creative Cloud', 300.00, 'Tools'),
  ('canva', 'Canva Pro', 149.00, 'Tools')
ON CONFLICT DO NOTHING;
