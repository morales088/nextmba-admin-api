import { Injectable } from '@nestjs/common';
import { SpeakerRepository } from '../repositories/speaker.repository';
import { CreateSpeakerDto } from '../dto/create-speaker.dto';
import { HashService } from 'src/common/utils/hash.service';

@Injectable()
export class SpeakersService {
    constructor(
      private readonly speakerRepository: SpeakerRepository,
      private readonly hashService: HashService,
    ) {}

    async getSpeaker(id:number) {
      return this.speakerRepository.findById(id);
    }
    
  async getSpeakers() {
    return this.speakerRepository.find();
  }

  async createSpeaker(data: CreateSpeakerDto) {
    const password = data.password ?? this.generateRandomString(8);
    const hashedPassword = await this.hashService.hashPassword(password);

    const speakerData = {
      ...data,
      password: hashedPassword,
    };

    return this.speakerRepository.insert(speakerData);
  }

  async updateSpeaker(id: number, data) {
    const speakerData = {
      ...data,
    };
    
    if (data.password) {
      const hashedPassword = await this.hashService.hashPassword(data.password);
      speakerData.password = hashedPassword;
    }

    return this.speakerRepository.updateSpeaker(id, speakerData);
  }

  generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    return randomString;
  }
}
