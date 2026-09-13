import type { ClassBookingModel } from '../interfaces/class-booking.repository.interface.js';
import type { ClassBookingEntity } from '../entities/class-booking.entity.js';

export function toClassBooking(
  model: ClassBookingModel,
  extras?: { className?: string; bookedByName?: string },
): ClassBookingEntity {
  return {
    id: model.id,
    classId: model.classId,
    className: extras?.className,
    bookedBy: model.bookedBy,
    bookedByName: extras?.bookedByName,
    purpose: model.purpose,
    startTime: model.startTime,
    endTime: model.endTime,
    isActive: model.isActive,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
