/*
  Warnings:

  - You are about to drop the column `dateOfBirth` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "students" DROP COLUMN "dateOfBirth",
ADD COLUMN     "address" TEXT;
