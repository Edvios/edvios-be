/*
  Warnings:

  - The `level` column on the `Program` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
ALTER TYPE "StudyLevel" ADD VALUE 'CERTIFICATE';

-- AlterTable
ALTER TABLE "Program" DROP COLUMN "level",
ADD COLUMN     "level" "StudyLevel";
