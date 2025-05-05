import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRegistrationDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  eventId: number;

  @IsNumber()
  registrationTypeId: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  additionalInfo?: string;
} 