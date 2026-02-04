-- Migration: Add gift_codes table
-- Run this on production database to add the gift codes feature
-- This is safe to run and will not affect existing data

-- Create the gift_codes table
CREATE TABLE IF NOT EXISTS "gift_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "item_description" VARCHAR(500) NOT NULL,
    "image_url" VARCHAR(255) NOT NULL,
    "fillout_url" VARCHAR(255) NOT NULL,
    "is_claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimed_at" TIMESTAMP(3),
    "email_sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gift_codes_pkey" PRIMARY KEY ("id")
);

-- Create unique index on code
CREATE UNIQUE INDEX IF NOT EXISTS "gift_codes_code_key" ON "gift_codes"("code");

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS "gift_codes_code_idx" ON "gift_codes"("code");

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS "gift_codes_email_idx" ON "gift_codes"("email");

-- Verify the table was created
SELECT 'gift_codes table created successfully' AS status 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gift_codes');


