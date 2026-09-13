import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ClassBookingService } from './class-booking.service.js';

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
      const now = new Date();

      for (const booking of bookings) {
        if (new Date(booking.endTime) <= now) {
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
