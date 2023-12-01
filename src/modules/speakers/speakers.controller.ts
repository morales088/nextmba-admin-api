import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SpeakersService } from './services/speakers.service';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsS3Service } from 'src/common/aws/aws_s3.service';

@Controller('speakers')
@UseGuards(AuthGuard('jwt'))
export class SpeakersController {
  constructor(
    private readonly speakersService: SpeakersService,
    private readonly awsS3Service: AwsS3Service
  ) {}

  @Get('/:speakerId')
  async getSpeaker(@Param('speakerId') speakerId: number) {
    return await this.speakersService.getSpeaker(speakerId);
  }

  @Get('/')
  async getSpeakers() {
    return await this.speakersService.getSpeakers();
  }

  @Post('/')
  @UseInterceptors(FileInterceptor('profile_photo'))
  async createSpeaker(
    @Body() createSpeakerDto: CreateSpeakerDto,
    @UploadedFile()
    profile_photo: Express.Multer.File
  ) {
    const speakerData = {
      ...createSpeakerDto,
    };
    if (profile_photo) {
      const path = 'images/speakers/profile';
      const fileUrl = await this.awsS3Service.upload(path, profile_photo);
      speakerData.profile = fileUrl;
    } 

    return await this.speakersService.createSpeaker(speakerData);
  }

  @Put('/:speakerId')
  @UseInterceptors(FileInterceptor('profile_photo'))
  async updateSpeaker(
    @Param('speakerId') speakerId: number,
    @Request() req: any,
    @Body() UpdateSpeakerDto: UpdateSpeakerDto,
    @UploadedFile()
    profile_photo: Express.Multer.File
  ) {
    const speakerData = {
      ...UpdateSpeakerDto,
    };
    if (profile_photo) {
      const path = 'images/speakers/profile';
      const fileUrl = await this.awsS3Service.upload(path, profile_photo);
      speakerData.profile = fileUrl;
    } 
    return await this.speakersService.updateSpeaker(speakerId, speakerData);
  }
}
