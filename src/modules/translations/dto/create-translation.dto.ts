import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTranslationDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['en', 'es', 'pt', 'fr']) // en - english, es - espanish, pt - portuguese, fr - french
  language_code: string;

  @IsNotEmpty()
  module_id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}
