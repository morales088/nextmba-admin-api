import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSpeakerDto {
  @IsNotEmpty()
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
  profile_photo: string;
}
