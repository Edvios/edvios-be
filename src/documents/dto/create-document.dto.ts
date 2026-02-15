import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsUrl()
  @IsNotEmpty()
  url: string;
}
