import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  ITeacherRepository,
  TeacherModel,
  TeacherWithRelations,
} from '../interfaces/teacher.repository.interface.js';

@Injectable()
export class TeacherRepository implements ITeacherRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    email: string;
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<TeacherModel> {
    return this.prisma.orm.public.Teacher.create(data);
  }

  async findAll(): Promise<TeacherWithRelations[]> {
    const teachers = (await (
      this.prisma.orm.public.Teacher.where({}) as any
    ).all()) as TeacherModel[];
    return this.enrichTeachers(teachers);
  }

  async findById(id: string): Promise<TeacherWithRelations | null> {
    const teacher = (await this.prisma.orm.public.Teacher.where({
      id,
    }).first()) as TeacherModel | null;
    if (!teacher) return null;
    const enriched = await this.enrichTeachers([teacher]);
    return enriched[0] ?? null;
  }

  async findByEmail(email: string): Promise<TeacherWithRelations | null> {
    const teacher = (await this.prisma.orm.public.Teacher.where({
      email,
    }).first()) as TeacherModel | null;
    if (!teacher) return null;
    const enriched = await this.enrichTeachers([teacher]);
    return enriched[0] ?? null;
  }

  async findByModuleId(moduleId: string): Promise<TeacherWithRelations[]> {
    const links = (await (
      this.prisma.orm.public.TeacherModule.where({ moduleId }) as any
    ).all()) as {
      teacherId: string;
    }[];
    if (links.length === 0) return [];
    const teacherIds = [...new Set(links.map((l) => l.teacherId))];
    const teachers: TeacherWithRelations[] = [];
    for (const tid of teacherIds) {
      const t = await this.findById(tid);
      if (t) teachers.push(t);
    }
    return teachers;
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.prisma.orm.public.Teacher.where({ id }).update(data);
  }

  async delete(id: string): Promise<void> {
    await (
      this.prisma.orm.public.TeacherModule.where({ teacherId: id }) as any
    ).delete();
    await (
      this.prisma.orm.public.TeacherFaculty.where({ teacherId: id }) as any
    ).delete();
    await this.prisma.orm.public.Teacher.where({ id }).delete();
  }

  async setFaculties(teacherId: string, facultyIds: string[]): Promise<void> {
    await (
      this.prisma.orm.public.TeacherFaculty.where({ teacherId }) as any
    ).delete();
    for (const facultyId of facultyIds) {
      await this.prisma.orm.public.TeacherFaculty.create({
        teacherId,
        facultyId,
      });
    }
  }

  async setModules(teacherId: string, moduleIds: string[]): Promise<void> {
    await (
      this.prisma.orm.public.TeacherModule.where({ teacherId }) as any
    ).delete();
    for (const moduleId of moduleIds) {
      await this.prisma.orm.public.TeacherModule.create({
        teacherId,
        moduleId,
      });
    }
  }

  private async enrichTeachers(
    teachers: TeacherModel[],
  ): Promise<TeacherWithRelations[]> {
    if (teachers.length === 0) return [];
    const teacherIds = teachers.map((t) => t.id);

    const allFacultyLinks = (await (
      this.prisma.orm.public.TeacherFaculty.where({}) as any
    ).all()) as {
      teacherId: string;
      facultyId: string;
    }[];
    const allModuleLinks = (await (
      this.prisma.orm.public.TeacherModule.where({}) as any
    ).all()) as {
      teacherId: string;
      moduleId: string;
    }[];

    const facultyMap = new Map<string, string[]>();
    for (const link of allFacultyLinks) {
      if (!teacherIds.includes(link.teacherId)) continue;
      const arr = facultyMap.get(link.teacherId) || [];
      arr.push(link.facultyId);
      facultyMap.set(link.teacherId, arr);
    }

    const moduleMap = new Map<string, string[]>();
    for (const link of allModuleLinks) {
      if (!teacherIds.includes(link.teacherId)) continue;
      const arr = moduleMap.get(link.teacherId) || [];
      arr.push(link.moduleId);
      moduleMap.set(link.teacherId, arr);
    }

    return teachers.map((t) => ({
      ...t,
      facultyIds: facultyMap.get(t.id) || [],
      moduleIds: moduleMap.get(t.id) || [],
    }));
  }
}
