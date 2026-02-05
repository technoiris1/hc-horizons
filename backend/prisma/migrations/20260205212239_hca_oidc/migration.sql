/*
  Warnings:

  - You are about to drop the column `is_verified` on the `user_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `otp_code` on the `user_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `otp_expires_at` on the `user_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `verified_at` on the `user_sessions` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_sessions_otp_code_idx";

-- AlterTable
ALTER TABLE "user_sessions" DROP COLUMN "is_verified",
DROP COLUMN "otp_code",
DROP COLUMN "otp_expires_at",
DROP COLUMN "verified_at";
