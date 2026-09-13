import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  IFloorPlanRepository,
  FloorPlanModel,
} from '../interfaces/floor-plan.repository.interface.js';
import type { JsonValue } from '@prisma/orm-postgres/target/codec-types';

@Injectable()
export class FloorPlanRepository implements IFloorPlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    seats: JsonValue;
    createdBy: string;
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<FloorPlanModel> {
    return this.prisma.orm.public.FloorPlan.create(data);
  }

  async findAll(): Promise<FloorPlanModel[]> {
    const results = await (
      this.prisma.orm.public.FloorPlan.where({}) as any
    ).all();
    return results as FloorPlanModel[];
  }

  async findById(id: string): Promise<FloorPlanModel | null> {
    return this.prisma.orm.public.FloorPlan.where({
      id,
    }).first();
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.prisma.orm.public.FloorPlan.where({ id }).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.orm.public.FloorPlan.where({ id }).delete();
  }
}
