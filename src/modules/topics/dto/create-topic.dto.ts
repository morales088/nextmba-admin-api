import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTopicDto {
  @IsNotEmpty()
  module_id: number;

  @IsNotEmpty()
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
  @IsIn([1, 2]) // [1 - main lecture, 2 - assignment]
  type: string;
  
  @IsOptional()
  @IsNumber()
  position: number;

  @IsOptional()
  @IsBoolean()
  publish: number;

}
