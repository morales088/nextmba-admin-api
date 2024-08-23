import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSpeakerDto {
  @IsNotEmpty()
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
  bio: string;

  @IsOptional()
  @IsString()
  profile: string;
}
