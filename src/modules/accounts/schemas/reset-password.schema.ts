import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ResetPasswordDocument = HydratedDocument<ResetPasswordToken>;

@Schema()
export class ResetPasswordToken {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true, default: Date.now, expires: 360000 })
  expiresAt: Date;
}

export const ResetPasswordTokenSchema = SchemaFactory.createForClass(ResetPasswordToken);
