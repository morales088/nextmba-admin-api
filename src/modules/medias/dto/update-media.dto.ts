import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMediaDto {
  @IsNotEmpty()
  topic_id: number;

  @IsOptional()
  @IsString()
  @IsIn(['en', 'es', 'pt', 'fr'],{ message: 'en - english, es - espanish, pt - portuguese, fr - french' })
  language_code: string;

  @IsOptional()
  @IsNumber()
  @IsIn([1, 2],{ message: '1 - livestream, 2 - replay' })
  media_type: number;

  @IsOptional()
  @IsNumber()
  @IsIn([1, 2, 3, 4],{ message: '[1 - yt, 2 - cf, 3 - vimeo, 4 - zoom]' })
  source: number;

  @IsOptional()
  @IsString()
  source_code: string;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1],{ message: '0 - delete, 1 - active' })
  status: number;
}
