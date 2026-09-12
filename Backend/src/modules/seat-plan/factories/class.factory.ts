import type { ClassModel } from '../interfaces/class.repository.interface.js';
import type {
  ClassEntity,
  SeatAssignment,
} from '../entities/seat-plan.entity.js';

export function toClass(model: ClassModel): ClassEntity {
  return {
    id: model.id,
    name: model.name,
    floorPlanId: model.floorPlanId,
    assignments: (typeof model.assignments === 'string'
      ? JSON.parse(model.assignments)
      : model.assignments) as SeatAssignment[],
    createdAt: model.createdAt as Date,
    updatedAt: model.updatedAt as Date,
  };
}
