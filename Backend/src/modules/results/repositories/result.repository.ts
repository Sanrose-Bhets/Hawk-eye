import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  IResultRepository,
  ResultModel,
  ResultItemModel,
} from '../interfaces/result.repository.interface.js';

@Injectable()
export class ResultRepository implements IResultRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    studentId: string;
    published: boolean;
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<ResultModel> {
    return this.prisma.orm.public.Result.create(data) as Promise<ResultModel>;
  }

  async findAll(): Promise<ResultModel[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (
      this.prisma.orm.public.Result.where({}) as any
    ).all();
    return results as ResultModel[];
  }

  async findById(id: string): Promise<ResultModel | null> {
    return this.prisma.orm.public.Result.where({
      id,
    }).first() as Promise<ResultModel | null>;
  }

  async findByStudentId(studentId: string): Promise<ResultModel | null> {
    return this.prisma.orm.public.Result.where({
      studentId,
    }).first() as Promise<ResultModel | null>;
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.prisma.orm.public.Result.where({ id }).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.orm.public.Result.where({ id }).delete();
  }

  async createItem(data: {
    resultId: string;
    moduleId: string;
    score: number;
    grade: string;
    createdAt: unknown;
  }): Promise<ResultItemModel> {
    return this.prisma.orm.public.ResultItem.create(
      data,
    ) as Promise<ResultItemModel>;
  }

  async findItemsByResultId(resultId: string): Promise<ResultItemModel[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (
      this.prisma.orm.public.ResultItem.where({ resultId }) as any
    ).all();
    return results as ResultItemModel[];
  }

  async deleteItemsByResultId(resultId: string): Promise<void> {
    await this.prisma.orm.public.ResultItem.where({ resultId }).delete();
  }
}
