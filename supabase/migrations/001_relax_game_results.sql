-- Make game_results columns optional that the client doesn't always have
ALTER TABLE public.game_results
  ALTER COLUMN season SET DEFAULT 1,
  ALTER COLUMN week SET DEFAULT 1,
  ALTER COLUMN stage SET DEFAULT 'regular',
  ALTER COLUMN player_team SET DEFAULT 'Player',
  ALTER COLUMN opponent_team SET DEFAULT 'Opponent';

-- Add season record columns to careers if not present
ALTER TABLE public.careers
  ADD COLUMN IF NOT EXISTS season_wins INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS season_losses INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_year INTEGER NOT NULL DEFAULT 1;

-- Add score columns with consistent naming
ALTER TABLE public.game_results
  ADD COLUMN IF NOT EXISTS score_for INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_against INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS played_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
