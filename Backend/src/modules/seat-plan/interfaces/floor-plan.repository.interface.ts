import type { JsonValue } from '@prisma/orm-postgres/target/codec-types';

export interface FloorPlanModel {
  id: string;
  name: string;
  seats: JsonValue;
  createdBy: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface IFloorPlanRepository {
  create(data: { name: string; seats: JsonValue; createdBy: string; createdAt: unknown; updatedAt: unknown }): Promise<FloorPlanModel>;
  findAll(): Promise<FloorPlanModel[]>;
  findById(id: string): Promise<FloorPlanModel | null>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
