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
import { TopicsService } from './services/topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { AuthGuard } from '@nestjs/passport';
import { AwsS3Service } from 'src/common/aws/aws_s3.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('topics')
@UseGuards(AuthGuard('jwt'))
export class TopicsController {
  constructor(
    private readonly topicsService: TopicsService,
    private readonly awsS3Service: AwsS3Service
  ) {}

  @Get('/:topicId')
  async getTopic(@Param('topicId') topicId: number) {
    return await this.topicsService.getTopic(topicId);
  }

  @Get('/')
  async getTopics() {
    return await this.topicsService.getTopics();
  }

  @Post('/')
  @UseInterceptors(FileInterceptor('file_cover'))
  async createTopic(
    @Body() createTopicDto: CreateTopicDto,
    @UploadedFile()
    file_cover: Express.Multer.File
  ) {
    const topicData = {
      ...createTopicDto,
    };
    if (file_cover) {
      const path = 'images/topics_cover';
      const fileUrl = await this.awsS3Service.upload(path, file_cover);
      topicData.cover_photo = fileUrl;
    }

    return await this.topicsService.createTopic(topicData);
  }

  @Put('/:topicId')
  @UseInterceptors(FileInterceptor('file_cover'))
  async updateTopic(
    @Param('topicId') topicId: number,
    @Request() req: any,
    @Body() updateTopicDto: UpdateTopicDto,
    @UploadedFile()
    file_cover: Express.Multer.File
  ) {

    const topicData = {
      ...updateTopicDto,
    };

    if (file_cover) {
      const path = 'images/topics_cover';
      const fileUrl = await this.awsS3Service.upload(path, file_cover);
      topicData.cover_photo = fileUrl;
    }
    return await this.topicsService.updateTopic(topicId, topicData);
  }
}
