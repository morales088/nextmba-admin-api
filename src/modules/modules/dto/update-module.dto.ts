import { Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, isNumber } from 'class-validator';

export class UpdateModuleDto {
  @IsOptional()
  course_id: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  custom_course_title: string;

  @IsOptional()
  @IsString()
  live_link: string;

  @IsOptional()
  @IsString()
  external_link: string;

  @IsOptional()
  @IsString()
  host_email: string;

  @IsOptional()
  @Type(() => Date)
  start_date: Date;

  @IsOptional()
  @Type(() => Date)
  end_date: Date;

  @IsOptional()
  @IsBoolean()
  display_topic: boolean;

  @IsOptional()
  @IsBoolean()
  display_speaker: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([1, 2, 3]) // 1 - Full, 2 - Limited, 3 - All
  tier: number;

  @IsOptional()
  event_id: string;

  @IsOptional()
  @IsString()
  recording_id: string;

  @IsOptional()
  @IsBoolean()
  recording_status: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1, 2, 3, 4, 5]) // [0 - delete, 1 - draft, 2 - offline, 3 - live, 4 - pending replay, 5 - replay]
  status: number;
}
