import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ClassBookingService } from './class-booking.service.js';

function toEpochMillis(value: Date | { epochMilliseconds?: number }): number {
  const epoch = (value as { epochMilliseconds?: number }).epochMilliseconds;
  return typeof epoch === 'number'
    ? epoch
    : new Date(value as Date).getTime();
}

@Injectable()
export class ClassBookingScheduler {
  private readonly logger = new Logger(ClassBookingScheduler.name);

  constructor(private readonly bookingService: ClassBookingService) {}

  @Cron('*/1 * * * *')
  async handleExpiredBookings() {
    try {
      const bookings = await this.bookingService.listBookings({
        isActive: true,
      });
      const now = Date.now();

      for (const booking of bookings) {
        if (toEpochMillis(booking.endTime as { epochMilliseconds?: number }) <= now) {
          await this.bookingService.freeClass(booking.id);
          this.logger.log(
            `Auto-freed expired booking: ${booking.id} (${booking.purpose})`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to free expired bookings', error);
    }
  }
}
