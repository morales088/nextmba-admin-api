import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Put,
  Request,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UserService } from './services/user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from '../images/services/image.service';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly imageService: ImageService
  ) {}

  @Get('/')
  async getUser(@Request() req: any) {
    const { email } = req.user;
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  @Get('/:userId')
  async getUserById(@Param('userId') userId: number) {
    const user = await this.userService.findById(userId);

    return user;
  }

  @Get('/all')
  async getAllUser(@Request() req: any) {
    const { email } = req.user;
    const user = await this.userService.findAllUsers();

    return user;
  }

  @Put('/:userId')
  async updateUser(
    @Param('userId') userId: number,
    @Request() req: any, 
    @Body() updateUserDto: UpdateUserDTO) {
    // const { userId } = req.user;
    const user = await this.userService.updateUser(userId, updateUserDto);
    return { message: 'User updated successfully.', user: user };
  }

  @Post('/change-password')
  async changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDTO) {
    const { email } = req.user;
    const user = await this.userService.changePassword(email, changePasswordDto);
    return { message: 'Password updated successfully.', user : user };
  }

  @Post('/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(@Request() req: any, @UploadedFile() file: Express.Multer.File = null) {
    const { userId } = req;
    const user = await this.userService.findById(userId);

    if (!file) {
      throw new BadRequestException('No files were uploaded.');
    }

    // check if the user has existing profile image
    if (user.profileImage) {
      await this.imageService.deleteImage(user.profileImage).catch((error) => {
        throw new BadRequestException(error.message);
      });
    }

    const folderName = 'profile-images';
    const { imageLink } = await this.imageService.uploadImage(file, folderName);

    await this.userService.uploadUserProfile(user.id, imageLink);

    return { message: 'Profile image uploaded successfully.' };
  }
}
