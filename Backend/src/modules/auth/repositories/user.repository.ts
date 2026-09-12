import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { IUserRepository } from '../interfaces/user.repository.interface.js';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    let user = await this.prisma.orm.public.Student.where({ email }).first();
    if (user) return { ...user, role: 'STUDENT' as const };

    user = await this.prisma.orm.public.StudentService.where({ email }).first();
    if (user) return { ...user, role: 'STUDENT_SERVICE' as const };

    user = await this.prisma.orm.public.RTE.where({ email }).first();
    if (user) return { ...user, role: 'RTE' as const };

    return null;
  }
}
