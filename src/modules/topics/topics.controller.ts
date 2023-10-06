import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { TopicsService } from './services/topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('topics')
@UseGuards(AuthGuard('jwt'))
export class TopicsController {
    constructor(
        private readonly topicsService: TopicsService,
      ) {}
      
    @Get('/')
    async getTopics() {
      return await this.topicsService.getTopics();
    }
    
    @Post('/')
    async createTopic(@Body() createTopicDto:CreateTopicDto) {
  
      const topicData = {
        ...createTopicDto,
      };

      return await this.topicsService.createTopic(topicData)
    }

    @Put('/:topicId')
    async updateModules(
      @Param('topicId') topicId: number,
      @Request() req: any, 
      @Body() updateTopicDto: UpdateTopicDto
      ) {
          return await this.topicsService.updateTopic(topicId, updateTopicDto)
    }
}
