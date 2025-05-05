import { IsOptional, IsString } from 'class-validator';

export class UpdateRegistrationDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  additionalInfo?: string;
} 