-- Database is already created by POSTGRES_DB env var
-- This script runs additional setup

-- Create indexes (tables are created by GORM AutoMigrate, so these may fail on first run)
-- They will be created properly once the app runs AutoMigrate
DO $$
BEGIN
    CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(latitude, longitude);
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table jobs does not exist yet, skipping index creation';
END $$;
