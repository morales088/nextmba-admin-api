import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateSpeakerDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long.',
  })
  @IsString()
  password: string;
  
  @IsOptional()
  @IsString()
  @IsIn(['en', 'es', 'pt', 'fr']) // en - english, es - espanish, pt - portuguese, fr - french
  language: string;

  @IsOptional()
  @IsString()
  position: string;

  @IsOptional()
  @IsString()
  company: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  profile: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1]) // 0 - delete, 1 - active
  status: number;
}
