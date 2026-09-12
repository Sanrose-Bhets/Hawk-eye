import type { FloorPlanModel } from '../interfaces/floor-plan.repository.interface.js';
import type {
  FloorPlanEntity,
  SeatPosition,
} from '../entities/seat-plan.entity.js';

export function toFloorPlan(model: FloorPlanModel): FloorPlanEntity {
  return {
    id: model.id,
    name: model.name,
    seats: (typeof model.seats === 'string'
      ? JSON.parse(model.seats)
      : model.seats) as SeatPosition[],
    createdBy: model.createdBy,
    createdAt: model.createdAt as Date,
    updatedAt: model.updatedAt as Date,
  };
}
