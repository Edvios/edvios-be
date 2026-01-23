import {
  IsString,
  IsBoolean,
  IsInt,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateProgramDto {
  @IsString()
  title: string;

  @IsString()
  level: string;

  @IsString()
  intakeId: string;

  @IsString()
  duration: string;

  @IsString()
  tuitionFee: string;

  @IsString()
  applicationFee: string;

  @IsString()
  englishTestScore: string;

  @IsString()
  subjectId: string;

  @IsBoolean()
  scholarship: boolean;

  @IsDateString()
  applicationDeadline: string | Date;

  @IsOptional()
  @IsString()
  ucasCode?: string;

  @IsBoolean()
  englishWaiver: boolean;

  @IsInt()
  @Min(0)
  popularityRank: number;

  @IsString()
  institutionId: string;
}
