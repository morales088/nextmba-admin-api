import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { TranslationsService } from './services/translations.service';
import { CreateTranslationDto } from './dto/create-translation.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateTranslationDto } from './dto/update-translation.dto';

@Controller('translations')
@UseGuards(AuthGuard('jwt'))
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @Get('/:translationId')
  async getTranslation(@Param('translationId') translationId: number) {
    return await this.translationsService.getTranslation(translationId);
  }

  @Get('module/:moduleId')
  async getByModuleId(@Param('moduleId') moduleId: number) {
    return await this.translationsService.getByModuleId(moduleId);
  }

  @Get('/')
  async getTranslations() {
    return await this.translationsService.getTranslations();
  }

  @Post('/')
  async createSpeaker(@Body() createTranslationDto: CreateTranslationDto) {
    const translationData = {
      ...createTranslationDto,
    };

    return await this.translationsService.createTranslation(translationData);
  }

  @Put('/:translationId')
  async updateModules(
    @Param('translationId') translationId: number,
    @Request() req: any,
    @Body() updateTranslationDto: UpdateTranslationDto
  ) {
    return await this.translationsService.updateTranslation(translationId, updateTranslationDto);
  }
}
