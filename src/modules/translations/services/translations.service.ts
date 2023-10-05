import { Injectable } from '@nestjs/common';
import { TranslationRepository } from '../repositories/translation.repositories.dto';

@Injectable()
export class TranslationsService {
    constructor(
      private readonly translationRepository: TranslationRepository
    ) {}

    async getTranslations() {
      return this.translationRepository.find();
    }

    async createTranslation(data){
        return this.translationRepository.insert(data);
    }

    async updateTranslation(id: number, data) {
      return this.translationRepository.updateTranslation(id, data);
    }
}
