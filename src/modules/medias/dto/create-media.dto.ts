import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMediaDto {
  @IsNotEmpty()
  module_id: number;

  @IsNotEmpty()
  topic_id: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['en', 'es', 'pt', 'fr'],{ message: 'en - english, es - espanish, pt - portuguese, fr - french' })
  language_code: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsIn([1, 2],{ message: '1 - livestream, 2 - replay' })
  media_type: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsIn([1, 2, 3, 4],{ message: '[1 - yt, 2 - cf, 3 - vimeo, 4 - zoom]' })
  source: number;

  @IsNotEmpty()
  @IsString()
  source_code: string;

}
