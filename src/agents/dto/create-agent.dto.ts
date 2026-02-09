import { IsNotEmpty, IsOptional} from 'class-validator';

export class CreateAgentDto {}

export class AgentRegisterDto {
    @IsNotEmpty()
    country: string;

    @IsNotEmpty()
    state: string;

    @IsNotEmpty()
    city: string;

    @IsOptional()
    companyName?: string;

    @IsOptional()
    comment?: string;

}
