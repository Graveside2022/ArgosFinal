-- Migration to add altitude column to signals table
-- This migration adds support for altitude tracking (useful for drone-based signal detection)

-- Check if altitude column exists, if not add it
ALTER TABLE signals ADD COLUMN altitude REAL DEFAULT 0;

-- Create index for altitude-based queries
CREATE INDEX IF NOT EXISTS idx_signals_altitude ON signals(altitude);

-- Update any existing records to have altitude 0 (ground level)
UPDATE signals SET altitude = 0 WHERE altitude IS NULL;