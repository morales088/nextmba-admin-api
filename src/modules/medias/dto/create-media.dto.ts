import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMediaDto {
  @IsNotEmpty()
  module_id: number;

  @IsNotEmpty()
  topic_id: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['en', 'es', 'pt', 'fr'], { message: 'en - english, es - spanish, pt - portuguese, fr - french' })
  language_code: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsIn([1, 2], { message: '1 - livestream, 2 - replay' })
  media_type: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsIn([1, 2, 3, 4], { message: '[1 - yt, 2 - cf, 3 - vimeo, 4 - zoom]' })
  source: number;

  @IsNotEmpty()
  @IsString()
  source_code: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([1, 2, 3, 4], { message: '[1 - yt, 2 - cf, 3 - vimeo, 4 - zoom]' })
  backup_source: number;

  @IsOptional()
  @IsString()
  backup_source_code: string;
}
