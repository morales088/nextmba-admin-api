import { Injectable } from '@nestjs/common';
import { ModuleRepository } from '../repositories/module.repository';

@Injectable()
export class ModulesService {
    constructor(
      private readonly moduleRepository: ModuleRepository
    ) {}
    
  async getModules() {
    return this.moduleRepository.find();
  }
    
  async createModules(data) {
    return this.moduleRepository.insert(data);
  }

  async updateModules(id: number, data) {
    return this.moduleRepository.update(id, data);
  }
}
