/*
  Warnings:

  - The values [PRIMIEM] on the enum `PartnershipType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PartnershipType_new" AS ENUM ('PREMIUM', 'STANDARD', 'BASIC');
ALTER TABLE "Institution" ALTER COLUMN "partnership" TYPE "PartnershipType_new" USING ("partnership"::text::"PartnershipType_new");
ALTER TYPE "PartnershipType" RENAME TO "PartnershipType_old";
ALTER TYPE "PartnershipType_new" RENAME TO "PartnershipType";
DROP TYPE "public"."PartnershipType_old";
COMMIT;
