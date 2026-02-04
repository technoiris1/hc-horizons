-- Add is_fraud column to projects table
-- This allows admins to flag individual projects as fraud
-- Safe to run on production: uses IF NOT EXISTS and sets default value
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_fraud BOOLEAN NOT NULL DEFAULT false;

