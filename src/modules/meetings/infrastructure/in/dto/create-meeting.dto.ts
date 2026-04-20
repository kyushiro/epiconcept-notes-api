import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsDateString()
  startAt: string; // ISO-8601; converted to Date in use-case

  @IsDateString()
  endAt: string;

  @IsString()
  @IsOptional()
  location?: string;
}
// tenantId from header, organizerId from JWT payload
