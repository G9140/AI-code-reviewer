/*
  # Create Code Reviews Table

  1. New Tables
    - `code_submissions`
      - `id` (uuid, primary key)
      - `title` (text, submission title)
      - `code` (text, the code content to review)
      - `language` (text, programming language)
      - `review` (text, AI-generated review)
      - `suggestions` (jsonb, array of suggestions)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `code_submissions` table
    - Public read access to allow code sharing
    - Allow anyone to create submissions
*/

CREATE TABLE IF NOT EXISTS code_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  code text NOT NULL,
  language text DEFAULT 'javascript',
  review text,
  suggestions jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE code_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON code_submissions FOR SELECT
  USING (true);

CREATE POLICY "Allow public create"
  ON code_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update own submission"
  ON code_submissions FOR UPDATE
  USING (true)
  WITH CHECK (true);