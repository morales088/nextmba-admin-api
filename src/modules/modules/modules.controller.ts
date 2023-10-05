import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ModulesService } from './services/modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Controller('modules')
@UseGuards(AuthGuard('jwt'))
export class ModulesController {
    constructor(
      private readonly modulesService: ModulesService,
    ) {}
    
  @Get('/')
  async getModules() {
    return await this.modulesService.getModules()
  }

  @Post('/')
  async createModule(@Body() createModuleDto: CreateModuleDto) {

    const moduleData = {
      ...createModuleDto,
    };

    return await this.modulesService.createModules(moduleData)
  }

  @Put('/:moduleId')
  async updateModules(
    @Param('moduleId') moduleId: number,
    @Request() req: any, 
    @Body() updateModuleDto: UpdateModuleDto
    ) {
        return await this.modulesService.updateModule(moduleId, updateModuleDto)
  }

}

