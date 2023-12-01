import { Prisma } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDecimal, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAffiliateWithdrawDto {

  @IsOptional()
  @IsString()
  withdrawal_info: string;

  @IsOptional()
  @IsString()
  remarks: string;
  
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsIn([0, 1, 2]) //[0 - decline, 1 - proccessed, 2 - pending]
  status: number;

}
