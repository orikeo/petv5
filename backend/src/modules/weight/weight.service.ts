import { CreateWeightDto } from './weight.types';
import { weightRepository } from './weight.repository';
import { ParsedWeightQuery } from './weight.query';

class WeightService {
  create(userId: string, dto: CreateWeightDto) {
  return weightRepository.create(userId, {
    entryDate: dto.entryDate, // ✅ string
    weight: dto.weight,
    note: dto.note
  });
}

  findByUser(userId: string, query: ParsedWeightQuery) {
  return weightRepository.findByUser(userId, query);
}
}

export const weightService = new WeightService();