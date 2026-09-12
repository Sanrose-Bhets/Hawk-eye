import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  IStudentRepository,
  StudentModel,
} from '../interfaces/student.repository.interface.js';

@Injectable()
export class StudentRepository implements IStudentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    email: string;
    password: string;
    address: string;
    contact: string;
    parentEmail: string;
    facultyId: string;
    role: 'STUDENT' | 'STUDENT_SERVICE' | 'RTE';
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<StudentModel> {
    return this.prisma.orm.public.Student.create(data) as Promise<StudentModel>;
  }

  async findAll(): Promise<StudentModel[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (
      this.prisma.orm.public.Student.where({}) as any
    ).all();
    return results as StudentModel[];
  }

  async findById(id: string): Promise<StudentModel | null> {
    return this.prisma.orm.public.Student.where({
      id,
    }).first() as Promise<StudentModel | null>;
  }

  async findByEmail(email: string): Promise<StudentModel | null> {
    return this.prisma.orm.public.Student.where({
      email,
    }).first() as Promise<StudentModel | null>;
  }

  async count(): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (
      this.prisma.orm.public.Student.where({}) as any
    ).all();
    return results.length;
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.prisma.orm.public.Student.where({ id }).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.orm.public.Student.where({ id }).delete();
  }
}
