import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTranslationDto {
  @IsOptional()
  @IsString()
  @IsIn(['en', 'es']) // en - english, es - espanish
  language_code: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1]) // 0 - delete, 1 - active
  status: number;
}
