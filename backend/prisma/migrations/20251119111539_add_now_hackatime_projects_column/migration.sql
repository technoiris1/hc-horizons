-- AlterTable
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'projects' 
        AND column_name = 'now_hackatime_projects'
    ) THEN
        ALTER TABLE "projects" ADD COLUMN "now_hackatime_projects" TEXT[] DEFAULT '{}';
    END IF;
END $$;

