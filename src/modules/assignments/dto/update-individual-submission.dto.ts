import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateIndividualSubmissionDto {
  @IsOptional()
  @IsString()
  answer_details: string;

  @IsOptional()
  @IsString()
  answer_feedback: string;
  
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1, 2]) // (0-reject, 1-accepted, 2-pending)
  status: number;

}
