-- Add max_per_user column to shop_items table
-- This allows admins to limit how many of a specific item each user can purchase
ALTER TABLE shop_items ADD COLUMN IF NOT EXISTS max_per_user INTEGER;


