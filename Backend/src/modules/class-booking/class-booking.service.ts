import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { Temporal } from 'temporal-polyfill';
import { CreateClassBookingDto } from './dto/create-class-booking.dto.js';
import { ListClassBookingsDto } from './dto/list-class-bookings.dto.js';
import type { IClassBookingRepository } from './interfaces/class-booking.repository.interface.js';
import type { IClassRepository } from '../seat-plan/interfaces/class.repository.interface.js';
import { toClassBooking } from './factories/class-booking.factory.js';
import { CLASS_BOOKING_REPOSITORY } from './constants/class-booking.constants.js';
import { CLASS_REPOSITORY } from '../seat-plan/constants/seat-plan.constants.js';
import type { ClassBookingEntity } from './entities/class-booking.entity.js';

function now() {
  return Temporal.Instant.fromEpochMilliseconds(Date.now());
}

@Injectable()
export class ClassBookingService {
  constructor(
    @Inject(CLASS_BOOKING_REPOSITORY)
    private readonly bookingRepo: IClassBookingRepository,
    @Inject(CLASS_REPOSITORY)
    private readonly classRepo: IClassRepository,
  ) {}

  async bookClass(userId: string, dto: CreateClassBookingDto): Promise<ClassBookingEntity> {
    const cls = await this.classRepo.findById(dto.classId);
    if (!cls) throw new NotFoundException('Class not found');

    const active = await this.bookingRepo.findActiveByClassId(dto.classId);
    if (active) throw new ConflictException('Class is already booked');

    const start = new Date();
    const end = new Date(start.getTime() + dto.durationMinutes * 60 * 1000);

    const booking = await this.bookingRepo.create({
      classId: dto.classId,
      bookedBy: userId,
      purpose: dto.purpose,
      startTime: start,
      endTime: end,
    });

    return toClassBooking(booking, { className: cls.name });
  }

  async listBookings(filters?: ListClassBookingsDto): Promise<ClassBookingEntity[]> {
    const bookings = await this.bookingRepo.findAll(filters);

    const enriched = await Promise.all(
      bookings.map(async (b) => {
        let className: string | undefined;
        try {
          const cls = await this.classRepo.findById(b.classId);
          className = cls?.name;
        } catch {
          // class deleted
        }
        return toClassBooking(b, { className });
      }),
    );

    return enriched;
  }

  async getBooking(id: string): Promise<ClassBookingEntity> {
    const booking = await this.bookingRepo.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');

    let className: string | undefined;
    try {
      const cls = await this.classRepo.findById(booking.classId);
      className = cls?.name;
    } catch {
      // class deleted
    }

    return toClassBooking(booking, { className });
  }

  async freeClass(id: string): Promise<ClassBookingEntity> {
    const booking = await this.bookingRepo.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');

    await this.bookingRepo.update(id, {
      isActive: false,
      updatedAt: now(),
    });

    return this.getBooking(id);
  }
}
