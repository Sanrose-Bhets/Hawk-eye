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
    semesters: number[];
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<ModuleModel> {
    const { semesters, ...moduleData } = data;
    const model = (await this.prisma.orm.public.Module.create(
      moduleData,
    )) as ModuleModel;

    // Create semester entries
    for (const semester of semesters) {
      await this.prisma.orm.public.ModuleSemester.create({
        moduleId: model.id,
        semester,
      });
    }

    return { ...model, semesters };
  }

  async findAll(): Promise<ModuleModel[]> {
    const results = (await (
      this.prisma.orm.public.Module.where({}) as any
    ).all()) as ModuleModel[];

    // Fetch semesters for all modules

    const allSemesters = (await (
      this.prisma.orm.public.ModuleSemester.where({}) as any
    ).all()) as { moduleId: string; semester: number }[];

    const semesterMap = new Map<string, number[]>();
    for (const ms of allSemesters) {
      const existing = semesterMap.get(ms.moduleId) || [];
      existing.push(ms.semester);
      semesterMap.set(ms.moduleId, existing);
    }

    return results.map((m) => ({
      ...m,
      semesters: semesterMap.get(m.id) || [],
    }));
  }

  async findById(id: string): Promise<ModuleModel | null> {
    const model = (await this.prisma.orm.public.Module.where({
      id,
    }).first()) as ModuleModel | null;
    if (!model) return null;

    const semesters = (await (
      this.prisma.orm.public.ModuleSemester.where({ moduleId: id }) as any
    ).all()) as { semester: number }[];

    return {
      ...model,
      semesters: semesters.map((s) => s.semester),
    };
  }

  async findByFacultyId(facultyId: string): Promise<ModuleModel[]> {
    const results = (await (
      this.prisma.orm.public.Module.where({ facultyId }) as any
    ).all()) as ModuleModel[];

    // Fetch semesters for these modules
    const moduleIds = results.map((m) => m.id);

    const allSemesters = (await (
      this.prisma.orm.public.ModuleSemester.where({}) as any
    ).all()) as { moduleId: string; semester: number }[];

    const semesterMap = new Map<string, number[]>();
    for (const ms of allSemesters) {
      if (moduleIds.includes(ms.moduleId)) {
        const existing = semesterMap.get(ms.moduleId) || [];
        existing.push(ms.semester);
        semesterMap.set(ms.moduleId, existing);
      }
    }

    return results.map((m) => ({
      ...m,
      semesters: semesterMap.get(m.id) || [],
    }));
  }

  async count(): Promise<number> {
    const results = await (
      this.prisma.orm.public.Module.where({}) as any
    ).all();
    return results.length;
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.prisma.orm.public.Module.where({ id }).update(data);
  }

  async setSemesters(moduleId: string, semesters: number[]): Promise<void> {
    // Delete existing semesters

    await (
      this.prisma.orm.public.ModuleSemester.where({ moduleId }) as any
    ).delete();

    // Create new semesters
    for (const semester of semesters) {
      await this.prisma.orm.public.ModuleSemester.create({
        moduleId,
        semester,
      });
    }
  }

  async delete(id: string): Promise<void> {
    // Delete semesters first

    await (
      this.prisma.orm.public.ModuleSemester.where({ moduleId: id }) as any
    ).delete();
    await this.prisma.orm.public.Module.where({ id }).delete();
  }
}
