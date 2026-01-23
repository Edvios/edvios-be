import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class ProgramFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  institutionId?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  intake?: string;

  @IsOptional()
  @IsString()
  subjectArea?: string;

  @IsOptional()
  @IsBoolean()
  scholarshipAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  englishWaiver?: boolean;
}
