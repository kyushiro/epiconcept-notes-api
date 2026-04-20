import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateNoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  content?: string;
}
