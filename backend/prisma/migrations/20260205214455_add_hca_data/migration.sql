/*
  Warnings:

  - A unique constraint covering the columns `[hca_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hca_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "hca_id" TEXT NOT NULL,
ADD COLUMN     "verification_status" TEXT,
ALTER COLUMN "birthday" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_hca_id_key" ON "users"("hca_id");
