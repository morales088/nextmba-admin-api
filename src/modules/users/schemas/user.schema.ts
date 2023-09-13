import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UploadUserImageDTO } from '../dto/create-user.dto';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {

  @Prop({ required: false })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, minlength: 8, select: false})
  password: string;

  @Prop({ required: false, type: UploadUserImageDTO })
  profileImage: UploadUserImageDTO;
}

export const UserSchema = SchemaFactory.createForClass(User);
