import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  IExamRoutineRepository,
  ExamRoutineModel,
} from '../interfaces/exam-routine.repository.interface.js';

@Injectable()
export class ExamRoutineRepository implements IExamRoutineRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    rteId: string;
    date: unknown;
    startTime: string;
    endTime: string;
    duration: string;
    facultyId: string;
    moduleId: string;
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<ExamRoutineModel> {
    return this.prisma.orm.public.ExamRoutine.create(data);
  }

  async findAll(): Promise<ExamRoutineModel[]> {
    const results = await (
      this.prisma.orm.public.ExamRoutine.where({}) as any
    ).all();
    return results as ExamRoutineModel[];
  }

  async findById(id: string): Promise<ExamRoutineModel | null> {
    return this.prisma.orm.public.ExamRoutine.where({
      id,
    }).first();
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.prisma.orm.public.ExamRoutine.where({ id }).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.orm.public.ExamRoutine.where({ id }).delete();
  }
}
