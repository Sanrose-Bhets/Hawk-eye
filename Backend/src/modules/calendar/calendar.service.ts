import {
  Injectable,
  NotFoundException,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { Temporal } from 'temporal-polyfill';
import { CALENDAR_REPOSITORY } from './constants/calendar.constants.js';
import type { ICalendarRepository } from './interfaces/calendar.repository.interface.js';
import { CreateCalendarNoteDto } from './dto/create-calendar-note.dto.js';
import { UpdateCalendarNoteDto } from './dto/update-calendar-note.dto.js';
import { CalendarNoteEntity } from './entities/calendar.entity.js';
import { toCalendarNote } from './factories/calendar.factory.js';
import { CacheService } from '../../common/cache/cache.service.js';

const CACHE_KEY = 'calendar:all';
const CACHE_TTL = 300; // 5 minutes

function now() {
  return Temporal.Instant.fromEpochMilliseconds(Date.now());
}

@Injectable()
export class CalendarService {
  constructor(
    @Inject(CALENDAR_REPOSITORY)
    private readonly calendarRepo: ICalendarRepository,
    private readonly cache: CacheService,
  ) {}

  async create(
    rteId: string,
    dto: CreateCalendarNoteDto,
  ): Promise<CalendarNoteEntity> {
    const ts = now();
    const model = await this.calendarRepo.create({
      rteId,
      date: Temporal.Instant.fromEpochMilliseconds(
        new Date(dto.date).getTime(),
      ),
      title: dto.title,
      content: dto.content,
      createdAt: ts,
      updatedAt: ts,
    });

    await this.cache.invalidatePattern('calendar:*');
    return toCalendarNote(model);
  }

  async findAll(
    rteId: string,
    filters?: { month?: number; year?: number },
  ): Promise<CalendarNoteEntity[]> {
    let all = await this.cache.get<any[]>(CACHE_KEY);
    if (!all) {
      all = await this.calendarRepo.findAll();
      await this.cache.set(CACHE_KEY, all, CACHE_TTL);
    }

    all = all.filter((n) => n.rteId === rteId);

    if (filters?.month !== undefined && filters?.year !== undefined) {
      all = all.filter((n) => {
        const epochMs =
          typeof (n.date as { epochMilliseconds?: number })
            .epochMilliseconds === 'number'
            ? (n.date as { epochMilliseconds: number }).epochMilliseconds
            : new Date(n.date as string).getTime();
        const d = new Date(epochMs);
        return (
          d.getMonth() + 1 === filters.month && d.getFullYear() === filters.year
        );
      });
    }

    all.sort((a, b) => {
      const aTime =
        typeof (a.date as { epochMilliseconds?: number }).epochMilliseconds ===
        'number'
          ? (a.date as { epochMilliseconds: number }).epochMilliseconds
          : new Date(a.date as string).getTime();
      const bTime =
        typeof (b.date as { epochMilliseconds?: number }).epochMilliseconds ===
        'number'
          ? (b.date as { epochMilliseconds: number }).epochMilliseconds
          : new Date(b.date as string).getTime();
      return aTime - bTime;
    });

    return all.map(toCalendarNote);
  }

  async findById(id: string, rteId: string): Promise<CalendarNoteEntity> {
    const model = await this.calendarRepo.findById(id);
    if (!model) {
      throw new NotFoundException('Calendar note not found');
    }
    if (model.rteId !== rteId) {
      throw new ForbiddenException('Access denied');
    }
    return toCalendarNote(model);
  }

  async update(
    id: string,
    rteId: string,
    dto: UpdateCalendarNoteDto,
  ): Promise<CalendarNoteEntity> {
    const existing = await this.calendarRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Calendar note not found');
    }
    if (existing.rteId !== rteId) {
      throw new ForbiddenException('Access denied');
    }

    const updateData: Record<string, unknown> = { updatedAt: now() };
    if (dto.date !== undefined) {
      updateData.date = Temporal.Instant.fromEpochMilliseconds(
        new Date(dto.date).getTime(),
      );
    }
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.content !== undefined) updateData.content = dto.content;

    await this.calendarRepo.update(id, updateData);
    await this.cache.invalidatePattern('calendar:*');
    return this.findById(id, rteId);
  }

  async delete(id: string, rteId: string): Promise<void> {
    const existing = await this.calendarRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Calendar note not found');
    }
    if (existing.rteId !== rteId) {
      throw new ForbiddenException('Access denied');
    }
    await this.calendarRepo.delete(id);
    await this.cache.invalidatePattern('calendar:*');
  }
}
