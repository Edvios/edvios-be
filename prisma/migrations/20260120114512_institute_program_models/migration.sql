-- CreateEnum
CREATE TYPE "InstitutionStatus" AS ENUM ('ACTIVE', 'PENDING', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PartnershipType" AS ENUM ('PRIMIEM', 'STANDARD', 'BASIC');

-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('AVAILABLE', 'DEADLINE_PASSED', 'FULL');

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InstitutionType" NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "ranking" INTEGER NOT NULL,
    "establishedYear" INTEGER NOT NULL,
    "totalStudents" INTEGER NOT NULL,
    "internationalStudents" INTEGER NOT NULL,
    "programsCount" INTEGER NOT NULL,
    "tuitionRange" TEXT NOT NULL,
    "status" "InstitutionStatus" NOT NULL,
    "partnership" "PartnershipType" NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "logo" TEXT,
    "description" TEXT NOT NULL,
    "specialties" TEXT[],
    "accreditations" TEXT[],
    "applicationDeadlines" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "intake" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "tuitionFee" TEXT NOT NULL,
    "applicationFee" TEXT NOT NULL,
    "englishTestScore" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "scholarship" BOOLEAN NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "applicationDeadline" TIMESTAMP(3) NOT NULL,
    "ucasCode" TEXT,
    "englishWaiver" BOOLEAN NOT NULL,
    "popularityRank" INTEGER NOT NULL,
    "status" "ProgramStatus" NOT NULL,
    "institutionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Program_institutionId_idx" ON "Program"("institutionId");

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
