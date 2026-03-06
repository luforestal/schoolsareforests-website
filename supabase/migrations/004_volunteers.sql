-- Schools Are Forests — Volunteers table
-- Stores expressions of interest from people who want to help

CREATE TABLE IF NOT EXISTS volunteers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL,
  interests   text[] NOT NULL,  -- e.g. ['species_id', 'fieldwork', 'web_dev', 'translations']
  message     text,
  created_at  timestamptz DEFAULT now() NOT NULL
);
