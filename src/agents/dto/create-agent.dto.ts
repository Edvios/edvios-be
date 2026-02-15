import {
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
} from 'class-validator';
import { FeatureType, ServiceType } from '@prisma/client';

export class CreateAgentDto {
  @IsNotEmpty()
  legalName: string;

  @IsOptional()
  tradingName?: string | null;

  @IsNotEmpty()
  agentName: string;

  @IsOptional()
  calendlyLink?: string | null;

  @IsNotEmpty()
  countryOfRegistration: string;

  @IsOptional()
  @IsInt()
  yearEstablished?: number | null;

  @IsOptional()
  websiteUrl?: string | null;

  @IsNotEmpty()
  officeAddress: string;

  @IsNotEmpty()
  contactPersonName: string;

  @IsOptional()
  designation?: string | null;

  @IsNotEmpty()
  officialEmail: string;

  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  businessRegistrationNumber: string;

  @IsOptional()
  businessRegistrationCertificate?: string | null;

  @IsOptional()
  officeAddressProof?: string | null;

  @IsOptional()
  @IsBoolean()
  registeredWithEducationCouncils?: boolean;

  @IsOptional()
  @IsBoolean()
  workingWithUkInstitutions?: boolean;

  @IsOptional()
  @IsBoolean()
  workingWithCanadaInstitutions?: boolean;

  @IsOptional()
  @IsBoolean()
  workingWithAustraliaInstitutions?: boolean;

  @IsOptional()
  @IsArray()
  primaryStudentMarkets?: string[];

  @IsOptional()
  @IsInt()
  averageStudentsPerYearLast2Years?: number | null;

  @IsOptional()
  @IsArray()
  mainDestinations?: string[];

  @IsOptional()
  typicalStudentProfileStrength?: string | null;

  @IsOptional()
  @IsBoolean()
  inHouseVisaSupport?: boolean;

  @IsOptional()
  @IsInt()
  numberOfCounsellors?: number;

  @IsOptional()
  @IsArray()
  servicesProvided?: ServiceType[];

  @IsOptional()
  reasonToUseEdvios?: string | null;

  @IsOptional()
  @IsArray()
  interestedFeatures?: FeatureType[];

  @IsOptional()
  agentTier?: string;

  @IsOptional()
  notes?: string | null;
}

export class AgentRegisterDto extends CreateAgentDto {}

export class AgentProfileData {
  id?: string;

  // Company information
  legalName?: string;
  tradingName?: string | null;
  agentName?: string;
  calendlyLink?: string | null;
  countryOfRegistration?: string;
  yearEstablished?: number | null;
  websiteUrl?: string | null;

  // Contact information
  officeAddress?: string;
  contactPersonName?: string;
  designation?: string | null;
  officialEmail?: string;
  phoneNumber?: string;

  // Registration documents
  businessRegistrationNumber?: string;
  businessRegistrationCertificate?: string | null;
  officeAddressProof?: string | null;

  // Partnerships & accreditations
  registeredWithEducationCouncils?: boolean;
  workingWithUkInstitutions?: boolean;
  workingWithCanadaInstitutions?: boolean;
  workingWithAustraliaInstitutions?: boolean;

  // Business details
  primaryStudentMarkets?: string[];
  averageStudentsPerYearLast2Years?: number | null;
  mainDestinations?: string[];
  typicalStudentProfileStrength?: string | null;

  // Services
  inHouseVisaSupport?: boolean;
  numberOfCounsellors?: number;
  servicesProvided?: ServiceType[];

  // Platform usage
  reasonToUseEdvios?: string | null;
  interestedFeatures?: FeatureType[];
  agentTier?: string;
  notes?: string | null;
}
