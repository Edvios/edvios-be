import { IsOptional,IsString } from 'class-validator';

export class applicationCreateDto {
    @IsString()
    programId: string;

    @IsString()
    @IsOptional()
    additionalNotes?: string;

    @IsString()
    preferredIntakeId: string;

    @IsString()
    academicYear: string;
}

export enum ApplicationStatus {
    PENDING = 'UNDER_REVIEW',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    WITHDRAWN = 'WITHDRAWN'
    
}
