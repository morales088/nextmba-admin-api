import { Injectable } from '@nestjs/common';
import { MediaRepository } from '../repositories/media.repository';

@Injectable()
export class MediasService {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async getMedia(id: number) {
    return this.mediaRepository.findById(id);
  }

  async getByModuleId(id: number) {
    return this.mediaRepository.findByModuleId(id);
  }

  async getMedias() {
    return await this.mediaRepository.find();
  }

  async createMedia(data) {
    return await this.mediaRepository.insert(data);
  }

  async updateMedia(id: number, data) {
    return await this.mediaRepository.updateMedia(id, data);
  }
}
