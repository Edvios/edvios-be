import {
  IsString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsArray,
  IsUrl,
  Min,
} from 'class-validator';
import {
  InstituteStatus,
  InstituteType,
  PartnershipType,
} from '../enums/institute.enums';

export class CreateInstituteDto {
  @IsString()
  name: string;

  @IsEnum(InstituteType)
  type: InstituteType;

  @IsString()
  country: string;

  @IsString()
  city: string;

  @IsInt()
  @Min(0)
  ranking: number;

  @IsInt()
  @Min(1800)
  establishedYear: number;

  @IsInt()
  @Min(0)
  totalStudents: number;

  @IsInt()
  @Min(0)
  internationalStudents: number;

  @IsInt()
  @Min(0)
  programsCount: number;

  @IsString()
  tuitionRange: string;

  @IsEnum(InstituteStatus)
  status: InstituteStatus;

  @IsEnum(PartnershipType)
  partnership: PartnershipType;

  @IsEmail()
  contactEmail: string;

  @IsUrl()
  website: string;

  @IsOptional()
  @IsUrl()
  logo?: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  specialties: string[];

  @IsArray()
  @IsString({ each: true })
  accreditations: string[];
}
