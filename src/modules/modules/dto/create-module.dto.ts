import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsDateString, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateModuleDto {
  @IsNotEmpty()
  course_id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  live_link: string;

  @IsOptional()
  @IsString()
  external_link: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  start_date: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  end_date: Date;

  @IsOptional()
  @IsBoolean()
  display_topic: boolean;

  @IsOptional()
  @IsBoolean()
  display_speaker: boolean;
}
