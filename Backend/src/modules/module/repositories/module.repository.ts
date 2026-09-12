import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  IModuleRepository,
  ModuleModel,
} from '../interfaces/module.repository.interface.js';

@Injectable()
export class ModuleRepository implements IModuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    code?: string;
    moduleLeader: string;
    facultyId: string;
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<ModuleModel> {
    return this.prisma.orm.public.Module.create(data) as Promise<ModuleModel>;
  }

  async findAll(): Promise<ModuleModel[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (
      this.prisma.orm.public.Module.where({}) as any
    ).all();
    return results as ModuleModel[];
  }

  async findById(id: string): Promise<ModuleModel | null> {
    return this.prisma.orm.public.Module.where({
      id,
    }).first() as Promise<ModuleModel | null>;
  }

  async findByFacultyId(facultyId: string): Promise<ModuleModel[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (
      this.prisma.orm.public.Module.where({ facultyId }) as any
    ).all();
    return results as ModuleModel[];
  }

  async count(): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (
      this.prisma.orm.public.Module.where({}) as any
    ).all();
    return results.length;
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.prisma.orm.public.Module.where({ id }).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.orm.public.Module.where({ id }).delete();
  }
}
