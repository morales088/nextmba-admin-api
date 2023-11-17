import { Injectable } from '@nestjs/common';
import { ModuleRepository } from 'src/modules/modules/repositories/module.repository';

@Injectable()
export class MeetingsService {
  constructor(private readonly moduleRepository: ModuleRepository) {}

  async getModule(id: number) {
    return this.moduleRepository.findById(id);
  }

  async updateModule(id: number, data) {
    return this.moduleRepository.updateModule(id, data);
  }
}
