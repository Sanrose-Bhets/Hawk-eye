import type { JsonValue } from '@prisma/orm-postgres/target/codec-types';

export interface ClassModel {
  id: string;
  name: string;
  floorPlanId: string;
  assignments: JsonValue;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface IClassRepository {
  create(data: {
    name: string;
    floorPlanId: string;
    assignments: JsonValue;
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<ClassModel>;
  findAll(): Promise<ClassModel[]>;
  findById(id: string): Promise<ClassModel | null>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
