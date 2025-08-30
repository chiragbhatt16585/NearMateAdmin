-- Update EndUserAddress table structure to Indian format
-- Remove old address fields and add new ones

-- First, add new columns
ALTER TABLE `EndUserAddress` ADD COLUMN `area` VARCHAR(191) NOT NULL DEFAULT '';
ALTER TABLE `EndUserAddress` ADD COLUMN `pincode` VARCHAR(191) NOT NULL DEFAULT '';

-- Update existing records with sample data (you may want to customize this)
UPDATE `EndUserAddress` SET 
  `area` = CONCAT('Area ', SUBSTRING(id, 1, 8)),
  `pincode` = '400000'
WHERE `area` = '' OR `pincode` = '';

-- Remove old columns
ALTER TABLE `EndUserAddress` DROP COLUMN `addressLine1`;
ALTER TABLE `EndUserAddress` DROP COLUMN `addressLine2`;
ALTER TABLE `EndUserAddress` DROP COLUMN `postalCode`;

-- Update the default values for new columns
ALTER TABLE `EndUserAddress` ALTER COLUMN `area` DROP DEFAULT;
ALTER TABLE `EndUserAddress` ALTER COLUMN `pincode` DROP DEFAULT;
