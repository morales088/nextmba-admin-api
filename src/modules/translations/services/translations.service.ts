import { Injectable } from '@nestjs/common';
import { TranslationRepository } from '../repositories/translation.repository';

@Injectable()
export class TranslationsService {
    constructor(
      private readonly translationRepository: TranslationRepository
    ) {}

    async getTranslation(id:number) {
      return this.translationRepository.findById(id);
    }

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
