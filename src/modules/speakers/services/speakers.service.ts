import { Injectable } from '@nestjs/common';
import { SpeakerRepository } from '../repositories/speaker.repository';
import { CreateSpeakerDto } from '../dto/create-speaker.dto';

@Injectable()
export class SpeakersService {
    constructor(
      private readonly speakerRepository: SpeakerRepository
    ) {}
    
  async getSpeakers() {
    return this.speakerRepository.find();
  }

  async createSpeaker(data: CreateSpeakerDto) {
    return this.speakerRepository.insert(data);
  }

  async updateSpeaker(id: number, data) {
    return this.speakerRepository.updateSpeaker(id, data);
  }
}
