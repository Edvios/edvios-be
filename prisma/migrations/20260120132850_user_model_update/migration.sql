-- AlterTable
ALTER TABLE "students" ADD COLUMN     "budgetRange" TEXT,
ADD COLUMN     "currentCity" TEXT,
ADD COLUMN     "currentCountry" TEXT,
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scholarshipInterest" BOOLEAN NOT NULL DEFAULT false;
