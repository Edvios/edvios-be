export class UpdateStudentDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
  nationality?: string | null;
  currentEducationLevel?: string | null;
  currentInstitution?: string | null;
  fieldOfStudy?: string | null;
  gpa?: number | null;
  graduationDate?: string | null; // ISO string
  preferredDestination?: string | null;
  preferredProgram?: string | null;
  preferredStudyLevel?: 'BACHELORS' | 'MASTERS' | 'PHD' | 'DIPLOMA' | null;
  preferredIntake?: string | null;
  englishTest?: string | null;
  englishScore?: string | null;
  hasValidPassport?: boolean;
  hasAcademicTranscripts?: boolean;
  hasRecommendationLetters?: boolean;
  hasPersonalStatement?: boolean;
  workExperience?: string | null;
  extraCurricular?: string | null;
  careerGoals?: string | null;
  referralSource?: string | null;
  preferredContactMethod?: string | null;
  bestTimeToContact?: string | null;
  additionalQuestions?: string | null;
  dob?: string | null; // ISO string
  currentCountry?: string | null;
  currentCity?: string | null;
  budgetRange?: string | null;
  scholarshipInterest?: boolean;
  marketingConsent?: boolean;
}
