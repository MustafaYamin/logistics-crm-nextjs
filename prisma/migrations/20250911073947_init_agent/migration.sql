/*
  Warnings:

  - You are about to drop the column `city` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Agent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Agent` DROP COLUMN `city`,
    DROP COLUMN `country`;
