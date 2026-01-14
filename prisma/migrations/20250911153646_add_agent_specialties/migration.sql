-- AlterTable
ALTER TABLE `Agent` ADD COLUMN `specialties` JSON NULL,
    MODIFY `phone` VARCHAR(191) NULL;
