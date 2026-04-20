import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(1)
  content: string;
}
// tenantId from header, authorId from JWT payload
