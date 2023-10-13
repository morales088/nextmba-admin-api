import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSpeakerDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  position: string;

  @IsOptional()
  @IsString()
  company: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  profile: string;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1]) // 0 - delete, 1 - active
  status: number;
}
