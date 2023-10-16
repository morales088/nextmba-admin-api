import { Injectable } from '@nestjs/common';
import { ModuleRepository } from '../repositories/module.repository';

@Injectable()
export class ModulesService {
    constructor(
      private readonly moduleRepository: ModuleRepository
    ) {}

    async getModule(id:number) {
      return this.moduleRepository.findById(id);
    }
    
  async getModules() {
    return this.moduleRepository.find();
  }
    
  async createModules(data) {
    return this.moduleRepository.insert(data);
  }

  async updateModule(id: number, data) {
    return this.moduleRepository.updateModule(id, data);
  }
}
