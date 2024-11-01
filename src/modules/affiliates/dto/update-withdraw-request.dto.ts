import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WithdrawRequestStatus } from '../../../common/constants/enum';

export class UpdateWithdrawRequestDto {
  @IsOptional()
  @IsString()
  withdrawal_info: string;

  @IsOptional()
  @IsString()
  remarks: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsEnum(WithdrawRequestStatus)
  status: number;
}
