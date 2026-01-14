/*
  Warnings:

  - A unique constraint covering the columns `[userId,email]` on the table `Agent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Agent_email_key` ON `Agent`;

-- CreateIndex
CREATE UNIQUE INDEX `Agent_userId_email_key` ON `Agent`(`userId`, `email`);
