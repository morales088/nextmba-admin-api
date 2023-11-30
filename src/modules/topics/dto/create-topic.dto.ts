import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTopicDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  module_id: number;

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

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_time: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end_time: Date;
  
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([1, 2, 3]) // [1 - main lecture, 2 - assignment, 3 - theoritical]
  type: number;
  
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  position: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1])
  publish: number

}
