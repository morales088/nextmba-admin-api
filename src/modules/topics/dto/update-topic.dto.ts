import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTopicDto {
  @IsNotEmpty()
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
  type: number;

  @IsOptional()
  @IsNumber()
  position: number;

  @IsOptional()
  @IsBoolean()
  publish: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1]) // 0 - delete, 1 - active
  status: number;
}
