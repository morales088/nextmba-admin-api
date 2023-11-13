import { Type } from 'class-transformer';
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
  @IsIn([1, 2]) // [1 - main lecture, 2 - assignment]
  type: string;

  @IsOptional()
  @IsNumber()
  position: number;

  @IsOptional()
  @IsBoolean()
  publish: number;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1]) // 0 - delete, 1 - active
  status: number;
}
