// import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { User, UserDocument } from '../schemas/user.schema';
// import { CreateUserDTO, UploadUserImageDTO } from '../dto/create-user.dto';
// import { HashService } from 'src/common/utils/hash.service';
// import { ChangePasswordDTO } from '../dto/change-password.dto';
// import { UpdateUserDTO } from '../dto/update-user.dto';

// @Injectable()
// export class UsersService {
//   constructor(
//     @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
//     private readonly hashService: HashService
//   ) {}

//   async getUserByEmail(email: string) {
//     return this.userModel.findOne({ email }).exec();
//   }

//   async getUserWithPassword(email: string) {
//     return this.userModel.findOne({ email }).select('+password').exec();
//   }

//   async getUserById(userId: string) {
//     const user = await this.userModel.findById(userId).exec();

//     if (!user) {
//       throw new NotFoundException('User not found.');
//     }

//     return user;
//   }

//   async updateUser(userId: string, updateUserDto: UpdateUserDTO): Promise<User> {
//     await this.getUserById(userId);
//     return this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true });
//   }

//   async uploadUserImage(userId: string, uploadUserImageDto: UploadUserImageDTO) {
//     await this.getUserById(userId);
//     return this.userModel.findByIdAndUpdate(userId, { profileImage: uploadUserImageDto }, { new: true });
//   }

//   async getUserByResetToken(token: string) {
//     return this.userModel.findOne({ resetPasswordToken: token }).exec();
//   }

//   async updatePassword(userId: string, newPassword: string) {
//     await this.userModel.updateOne({ _id: userId }, { password: newPassword });
//   }

//   async changePassword(email: string, changePasswordDto: ChangePasswordDTO) {
//     const { oldPassword, newPassword, confirmPassword } = changePasswordDto;
    
//     const user = await this.getUserWithPassword(email);
//     const isOldPasswordValid = await this.hashService.comparePassword(oldPassword, user.password);

//     if (!isOldPasswordValid) {
//       throw new UnauthorizedException('Invalid old password.');
//     }

//     if (newPassword === oldPassword) {
//       throw new BadRequestException('New password must be different from the old password.');
//     }

//     if (newPassword !== confirmPassword) {
//       throw new BadRequestException('New password and confirmation password must match.');
//     }

//     const newHashedPassword = await this.hashService.hashPassword(newPassword);
//     user.password = newHashedPassword;
//     return user.save();
//   }
// }
