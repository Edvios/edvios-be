/*
  Warnings:

  - Added the required column `city` to the `agents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `agents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `agents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "agents" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL;
