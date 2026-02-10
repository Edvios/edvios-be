/*
  Warnings:

  - You are about to drop the column `city` on the `agents` table. All the data in the column will be lost.
  - You are about to drop the column `comment` on the `agents` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `agents` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `agents` table. All the data in the column will be lost.
  - You are about to drop the column `isSelected` on the `agents` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `agents` table. All the data in the column will be lost.
  - You are about to drop the column `additionalQuestions` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `bestTimeToContact` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `budgetRange` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `careerGoals` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `currentCity` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `currentCountry` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `currentEducationLevel` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `currentInstitution` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `englishScore` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `englishTest` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `extraCurricular` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `fieldOfStudy` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `gpa` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `graduationDate` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `hasAcademicTranscripts` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `hasPersonalStatement` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `hasRecommendationLetters` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `hasValidPassport` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `marketingConsent` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `preferredContactMethod` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `preferredDestination` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `preferredIntake` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `preferredProgram` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `referralSource` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `scholarshipInterest` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `workExperience` on the `students` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[passportNumber]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `agentName` to the `agents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessRegistrationNumber` to the `agents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactPersonName` to the `agents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryOfRegistration` to the `agents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `legalName` to the `agents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `officeAddress` to the `agents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `officialEmail` to the `agents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `agents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryOfResidence` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergencyContact` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `highestQualification` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institutionName` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passportExpiryDate` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passportNumber` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preferredFieldOfStudy` to the `students` table without a default value. This is not possible if the table is not empty.
  - Made the column `nationality` on table `students` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `students` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `students` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "EnglishTestType" AS ENUM ('IELTS', 'PTE', 'DUOLINGO', 'NONE');

-- CreateEnum
CREATE TYPE "FundingSource" AS ENUM ('SELF', 'PARENTS', 'SPONSOR', 'LOAN', 'SCHOLARSHIP');

-- CreateEnum
CREATE TYPE "VisaRiskBand" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('ADMISSIONS', 'VISA', 'END_TO_END');

-- CreateEnum
CREATE TYPE "FeatureType" AS ENUM ('AI_MATCHING', 'VISA_RISK', 'CRM', 'ANALYTICS', 'DOCUMENT_MANAGEMENT');

-- DropIndex
DROP INDEX "students_email_key";

-- AlterTable
ALTER TABLE "agents" DROP COLUMN "city",
DROP COLUMN "comment",
DROP COLUMN "companyName",
DROP COLUMN "country",
DROP COLUMN "isSelected",
DROP COLUMN "state",
ADD COLUMN     "agentName" TEXT NOT NULL,
ADD COLUMN     "agentTier" TEXT NOT NULL DEFAULT 'BASIC',
ADD COLUMN     "averageStudentsPerYearLast2Years" INTEGER,
ADD COLUMN     "businessRegistrationCertificate" TEXT,
ADD COLUMN     "businessRegistrationNumber" TEXT NOT NULL,
ADD COLUMN     "calendlyLink" TEXT,
ADD COLUMN     "contactPersonName" TEXT NOT NULL,
ADD COLUMN     "countryOfRegistration" TEXT NOT NULL,
ADD COLUMN     "designation" TEXT,
ADD COLUMN     "inHouseVisaSupport" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "interestedFeatures" "FeatureType"[],
ADD COLUMN     "legalName" TEXT NOT NULL,
ADD COLUMN     "mainDestinations" TEXT[],
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "numberOfCounsellors" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "officeAddress" TEXT NOT NULL,
ADD COLUMN     "officeAddressProof" TEXT,
ADD COLUMN     "officialEmail" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "primaryStudentMarkets" TEXT[],
ADD COLUMN     "reasonToUseEdvios" TEXT,
ADD COLUMN     "registeredWithEducationCouncils" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "servicesProvided" "ServiceType"[],
ADD COLUMN     "tradingName" TEXT,
ADD COLUMN     "typicalStudentProfileStrength" TEXT,
ADD COLUMN     "websiteUrl" TEXT,
ADD COLUMN     "workingWithAustraliaInstitutions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workingWithCanadaInstitutions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workingWithUkInstitutions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "yearEstablished" INTEGER;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "additionalQuestions",
DROP COLUMN "address",
DROP COLUMN "bestTimeToContact",
DROP COLUMN "budgetRange",
DROP COLUMN "careerGoals",
DROP COLUMN "createdAt",
DROP COLUMN "currentCity",
DROP COLUMN "currentCountry",
DROP COLUMN "currentEducationLevel",
DROP COLUMN "currentInstitution",
DROP COLUMN "englishScore",
DROP COLUMN "englishTest",
DROP COLUMN "extraCurricular",
DROP COLUMN "fieldOfStudy",
DROP COLUMN "gpa",
DROP COLUMN "graduationDate",
DROP COLUMN "hasAcademicTranscripts",
DROP COLUMN "hasPersonalStatement",
DROP COLUMN "hasRecommendationLetters",
DROP COLUMN "hasValidPassport",
DROP COLUMN "marketingConsent",
DROP COLUMN "preferredContactMethod",
DROP COLUMN "preferredDestination",
DROP COLUMN "preferredIntake",
DROP COLUMN "preferredProgram",
DROP COLUMN "referralSource",
DROP COLUMN "scholarshipInterest",
DROP COLUMN "workExperience",
ADD COLUMN     "academicCertificates" TEXT[],
ADD COLUMN     "academicFit" TEXT,
ADD COLUMN     "countryOfResidence" TEXT NOT NULL,
ADD COLUMN     "emergencyContact" TEXT NOT NULL,
ADD COLUMN     "englishTestTaken" "EnglishTestType" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "estimatedBudget" DOUBLE PRECISION,
ADD COLUMN     "fundingSource" "FundingSource",
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "gradesSummary" TEXT,
ADD COLUMN     "highestQualification" TEXT NOT NULL,
ADD COLUMN     "institutionName" TEXT NOT NULL,
ADD COLUMN     "intendedIntakeMonth" INTEGER,
ADD COLUMN     "intendedIntakeYear" INTEGER,
ADD COLUMN     "mediumOfInstruction" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "ongoingImmigrationApps" TEXT,
ADD COLUMN     "overallScore" DOUBLE PRECISION,
ADD COLUMN     "passportExpiryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "passportNumber" TEXT NOT NULL,
ADD COLUMN     "preferredCountries" TEXT[],
ADD COLUMN     "preferredFieldOfStudy" TEXT NOT NULL,
ADD COLUMN     "previousVisaRefusal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "testExpiryDate" TIMESTAMP(3),
ADD COLUMN     "travelHistory" TEXT,
ADD COLUMN     "visaRefusalDetails" TEXT,
ADD COLUMN     "visaRiskBand" "VisaRiskBand",
ADD COLUMN     "yearOfCompletion" INTEGER,
ALTER COLUMN "nationality" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "students_passportNumber_key" ON "students"("passportNumber");
