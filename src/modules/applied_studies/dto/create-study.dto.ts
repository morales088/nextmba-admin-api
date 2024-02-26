import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStudyDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  course_id: number;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  speaker_id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  cover_photo: string;

}
