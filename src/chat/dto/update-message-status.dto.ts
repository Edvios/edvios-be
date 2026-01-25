import { IsEnum, IsArray, IsString } from 'class-validator';
import { MessageStatus } from '@prisma/client';

export class UpdateMessageStatusDto {
  @IsArray()
  @IsString({ each: true })
  messageIds: string[];

  @IsEnum(MessageStatus)
  status: MessageStatus;
}
