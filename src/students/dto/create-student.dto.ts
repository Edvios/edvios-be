import {
  EnglishTestType,
  FundingSource,
  Gender,
  StudyLevel,
  VisaRiskBand,
} from '@prisma/client';

export class CreateStudentDto {
  // Personal info
  firstName?: string | null;
  lastName?: string | null;
  dob: string; // ISO string
  gender?: Gender | null;
  nationality: string;
  passportNumber: string;
  passportExpiryDate: string; // ISO string
  countryOfResidence: string;

  // Contact
  email: string;
  phone: string;
  emergencyContact: string;

  // Academic background
  highestQualification: string;
  yearOfCompletion?: number | null;
  institutionName: string;
  mediumOfInstruction?: string | null;
  gradesSummary?: string | null;
  academicCertificates?: string[];

  // English test
  englishTestTaken?: EnglishTestType;
  overallScore?: number | null;
  testExpiryDate?: string | null; // ISO string

  // Study preferences
  intendedIntakeMonth?: number | null; // 1–12
  intendedIntakeYear?: number | null;
  preferredCountries?: string[];
  preferredStudyLevel?: StudyLevel | null;
  preferredFieldOfStudy: string;

  // Financial
  estimatedBudget?: number | null;
  fundingSource?: FundingSource | null;

  // Visa / immigration
  previousVisaRefusal?: boolean;
  visaRefusalDetails?: string | null;
  travelHistory?: string | null;
  ongoingImmigrationApps?: string | null;

  // Internal / assessment
  academicFit?: string | null;
  visaRiskBand?: VisaRiskBand | null;
  notes?: string | null;
}
