/*
  Warnings:

  - You are about to drop the column `name` on the `ServiceCategory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `ServiceCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `ServiceCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `ServiceCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ServiceCategory_name_key";

-- AlterTable with backfill for existing rows
ALTER TABLE "ServiceCategory"
    ADD COLUMN "key" TEXT,
    ADD COLUMN "label" TEXT,
    ADD COLUMN "tone" TEXT;

-- Backfill existing rows using previous name
UPDATE "ServiceCategory" SET "key" = lower(replace("name", ' ', '_')) WHERE "key" IS NULL;
UPDATE "ServiceCategory" SET "label" = COALESCE("name", 'Category') WHERE "label" IS NULL;

-- Now enforce NOT NULL and drop old column
ALTER TABLE "ServiceCategory"
    ALTER COLUMN "key" SET NOT NULL,
    ALTER COLUMN "label" SET NOT NULL,
    DROP COLUMN "name";

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_key_key" ON "ServiceCategory"("key");
