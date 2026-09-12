import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  IMailRepository,
  EmailLogModel,
} from '../interfaces/mail.repository.interface.js';

@Injectable()
export class MailRepository implements IMailRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    to: string;
    subject: string;
    body: string;
    studentId?: string;
    status: string;
    createdAt: unknown;
  }): Promise<EmailLogModel> {
    return this.prisma.orm.public.EmailLog.create(
      data,
    ) as Promise<EmailLogModel>;
  }

  async findAll(): Promise<EmailLogModel[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (
      this.prisma.orm.public.EmailLog.where({}) as any
    ).all();
    return results as EmailLogModel[];
  }

  async findById(id: string): Promise<EmailLogModel | null> {
    return this.prisma.orm.public.EmailLog.where({
      id,
    }).first() as Promise<EmailLogModel | null>;
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.prisma.orm.public.EmailLog.where({ id }).update(data);
  }

  async count(): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (
      this.prisma.orm.public.EmailLog.where({}) as any
    ).all();
    return results.length;
  }

  async countByStatus(status: string): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (
      this.prisma.orm.public.EmailLog.where({ status }) as any
    ).all();
    return results.length;
  }
}
