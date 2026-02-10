import { IsNotEmpty, IsOptional, IsBoolean, IsInt, IsArray } from 'class-validator';
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
