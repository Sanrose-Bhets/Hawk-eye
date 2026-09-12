import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Temporal } from 'temporal-polyfill';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  IClassBookingRepository,
  ClassBookingModel,
} from '../interfaces/class-booking.repository.interface.js';

function now() {
  return Temporal.Instant.fromEpochMilliseconds(Date.now());
}

@Injectable()
export class ClassBookingRepository implements IClassBookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    classId: string;
    bookedBy: string;
    purpose: string;
    startTime: Date;
    endTime: Date;
  }): Promise<ClassBookingModel> {
    const ts = now();
    return this.prisma.orm.public.ClassBooking.create({
      id: randomUUID(),
      classId: data.classId,
      bookedBy: data.bookedBy,
      purpose: data.purpose,
      startTime: Temporal.Instant.fromEpochMilliseconds(data.startTime.getTime()),
      endTime: Temporal.Instant.fromEpochMilliseconds(data.endTime.getTime()),
      isActive: true,
      createdAt: ts,
      updatedAt: ts,
    }) as Promise<ClassBookingModel>;
  }

  async findAll(filters?: { classId?: string; isActive?: boolean }): Promise<ClassBookingModel[]> {
    const where: Record<string, unknown> = {};
    if (filters?.classId) where.classId = filters.classId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (this.prisma.orm.public.ClassBooking.where(where) as any).all();
    return results as ClassBookingModel[];
  }

  async findById(id: string): Promise<ClassBookingModel | null> {
    return this.prisma.orm.public.ClassBooking.where({ id }).first() as Promise<ClassBookingModel | null>;
  }

  async findActiveByClassId(classId: string): Promise<ClassBookingModel | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma.orm.public.ClassBooking.where({ classId, isActive: true }).first() as any) as Promise<ClassBookingModel | null>;
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    if (data.updatedAt instanceof Date) {
      data.updatedAt = Temporal.Instant.fromEpochMilliseconds(data.updatedAt.getTime());
    }
    await this.prisma.orm.public.ClassBooking.where({ id }).update(data);
  }

  async deactivateExpired(now: Date): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expired = await (this.prisma.orm.public.ClassBooking.where({
      isActive: true,
    }) as any).all();

    let count = 0;
    for (const booking of expired as ClassBookingModel[]) {
      if (new Date(booking.endTime as unknown as string) <= now) {
        await this.update(booking.id, { isActive: false, updatedAt: now });
        count++;
      }
    }
    return count;
  }
}
