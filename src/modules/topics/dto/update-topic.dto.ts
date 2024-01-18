import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTopicDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  speaker_id: number;

  @IsOptional()
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
  @IsIn([1, 2, 3, 4])  // [1 - main lecture, 2 - assignment, 3 - bunos, 4 - theoritical]
  type: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  position: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  library_position: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1])
  publish: number

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  featured_lecture: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  hide_recordings: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1]) // 0 - delete, 1 - active
  status: number;
}
