import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  IAdmitCardRepository,
  AdmitCardModel,
} from '../interfaces/admit-card.repository.interface.js';

@Injectable()
export class AdmitCardRepository implements IAdmitCardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    studentId: string;
    examRoutineId: string;
    seatNumber?: string;
    roomName?: string;
    pdfKey?: string;
    generatedBy: string;
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<AdmitCardModel> {
    return this.prisma.orm.public.AdmitCard.create(
      data,
    ) as Promise<AdmitCardModel>;
  }

  async findAll(): Promise<AdmitCardModel[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (
      this.prisma.orm.public.AdmitCard.where({}) as any
    ).all();
    return results as AdmitCardModel[];
  }

  async findById(id: string): Promise<AdmitCardModel | null> {
    return this.prisma.orm.public.AdmitCard.where({
      id,
    }).first() as Promise<AdmitCardModel | null>;
  }

  async findByStudentId(studentId: string): Promise<AdmitCardModel[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (
      this.prisma.orm.public.AdmitCard.where({ studentId }) as any
    ).all();
    return results as AdmitCardModel[];
  }

  async findByExamRoutineId(examRoutineId: string): Promise<AdmitCardModel[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (
      this.prisma.orm.public.AdmitCard.where({ examRoutineId }) as any
    ).all();
    return results as AdmitCardModel[];
  }

  async findUnique(studentId: string, examRoutineId: string): Promise<AdmitCardModel | null> {
    return this.prisma.orm.public.AdmitCard.where({
      studentId,
      examRoutineId,
    }).first() as Promise<AdmitCardModel | null>;
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.prisma.orm.public.AdmitCard.where({ id }).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.orm.public.AdmitCard.where({ id }).delete();
  }
}
