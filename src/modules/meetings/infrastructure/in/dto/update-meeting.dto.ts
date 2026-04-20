import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateMeetingDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startAt?: string;

  @IsDateString()
  @IsOptional()
  endAt?: string;

  @IsString()
  @IsOptional()
  location?: string | null;
}
