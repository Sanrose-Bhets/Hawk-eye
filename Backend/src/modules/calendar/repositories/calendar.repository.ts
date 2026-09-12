import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  ICalendarRepository,
  CalendarNoteModel,
} from '../interfaces/calendar.repository.interface.js';

@Injectable()
export class CalendarRepository implements ICalendarRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    rteId: string;
    date: unknown;
    title: string;
    content?: string;
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<CalendarNoteModel> {
    return this.prisma.orm.public.CalendarNote.create(
      data,
    ) as Promise<CalendarNoteModel>;
  }

  async findAll(): Promise<CalendarNoteModel[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (
      this.prisma.orm.public.CalendarNote.where({}) as any
    ).all();
    return results as CalendarNoteModel[];
  }

  async findById(id: string): Promise<CalendarNoteModel | null> {
    return this.prisma.orm.public.CalendarNote.where({
      id,
    }).first() as Promise<CalendarNoteModel | null>;
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.prisma.orm.public.CalendarNote.where({ id }).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.orm.public.CalendarNote.where({ id }).delete();
  }
}
