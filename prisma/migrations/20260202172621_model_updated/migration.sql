/*
  Warnings:

  - The values [SELECTED_AGENT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/

-- Data Migration: Convert SELECTED_AGENT to AGENT before removing the enum value

-- 1. Convert users with SELECTED_AGENT role to AGENT
UPDATE "users"
SET "role" = 'AGENT'
WHERE "role"::text = 'SELECTED_AGENT';

-- 2. Convert chat messages (senderRole)
UPDATE "chat_messages"
SET "senderRole" = 'AGENT'
WHERE "senderRole"::text = 'SELECTED_AGENT';

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'AGENT', 'STUDENT', 'PENDING_AGENT', 'REJECTED_AGENT');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TABLE "chat_messages" ALTER COLUMN "senderRole" TYPE "UserRole_new" USING ("senderRole"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
COMMIT;
