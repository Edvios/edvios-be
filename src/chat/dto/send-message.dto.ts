import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsString()
  @IsOptional() // Content is optional if there's an attachment
  content?: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;

  @IsString()
  @IsOptional()
  attachmentType?: string;

  @IsString()
  @IsOptional()
  attachmentName?: string;

  @IsNumber()
  @IsOptional()
  attachmentSize?: number;
}

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  senderId: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  senderRole: UserRole;
}
