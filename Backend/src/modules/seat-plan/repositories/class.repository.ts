import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  IClassRepository,
  ClassModel,
} from '../interfaces/class.repository.interface.js';
import type { JsonValue } from '@prisma/orm-postgres/target/codec-types';

@Injectable()
export class ClassRepository implements IClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    floorPlanId: string;
    assignments: JsonValue;
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<ClassModel> {
    return this.prisma.orm.public.Class.create(data) as Promise<ClassModel>;
  }

  async findAll(): Promise<ClassModel[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (this.prisma.orm.public.Class.where({}) as any).all();
    return results as ClassModel[];
  }

  async findById(id: string): Promise<ClassModel | null> {
    return this.prisma.orm.public.Class.where({
      id,
    }).first() as Promise<ClassModel | null>;
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.prisma.orm.public.Class.where({ id }).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.orm.public.Class.where({ id }).delete();
  }
}
