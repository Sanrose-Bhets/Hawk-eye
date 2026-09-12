import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Temporal } from 'temporal-polyfill';
import type { JsonValue } from '@prisma/orm-postgres/target/codec-types';
import { CreateFloorPlanDto } from './dto/create-floor-plan.dto.js';
import { CreateClassDto } from './dto/create-class.dto.js';
import { UpdateFloorPlanDto } from './dto/update-floor-plan.dto.js';
import { UpdateClassDto } from './dto/update-class.dto.js';
import type { IFloorPlanRepository } from './interfaces/floor-plan.repository.interface.js';
import type { IClassRepository } from './interfaces/class.repository.interface.js';
import { toFloorPlan } from './factories/floor-plan.factory.js';
import { toClass } from './factories/class.factory.js';
import {
  FLOOR_PLAN_REPOSITORY,
  CLASS_REPOSITORY,
} from './constants/seat-plan.constants.js';
import type { FloorPlanEntity } from './entities/seat-plan.entity.js';
import type { ClassEntity } from './entities/seat-plan.entity.js';

function now() {
  return Temporal.Instant.fromEpochMilliseconds(Date.now());
}

@Injectable()
export class SeatPlanService {
  constructor(
    @Inject(FLOOR_PLAN_REPOSITORY)
    private readonly floorPlanRepo: IFloorPlanRepository,
    @Inject(CLASS_REPOSITORY) private readonly classRepo: IClassRepository,
  ) {}

  async createFloorPlan(dto: CreateFloorPlanDto): Promise<FloorPlanEntity> {
    const model = await this.floorPlanRepo.create({
      name: dto.name,
      seats: dto.seats as unknown as JsonValue,
      createdBy: dto.createdBy,
      createdAt: now(),
      updatedAt: now(),
    });
    return toFloorPlan(model);
  }

  async getFloorPlans(): Promise<FloorPlanEntity[]> {
    const models = await this.floorPlanRepo.findAll();
    return models.map(toFloorPlan);
  }

  async getFloorPlan(id: string): Promise<FloorPlanEntity> {
    const model = await this.floorPlanRepo.findById(id);
    if (!model) throw new NotFoundException('Floor plan not found');
    return toFloorPlan(model);
  }

  async updateFloorPlan(
    id: string,
    dto: UpdateFloorPlanDto,
  ): Promise<FloorPlanEntity> {
    const existing = await this.floorPlanRepo.findById(id);
    if (!existing) throw new NotFoundException('Floor plan not found');

    const updateData: Record<string, unknown> = { updatedAt: now() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.seats !== undefined)
      updateData.seats = dto.seats as unknown as JsonValue;

    await this.floorPlanRepo.update(id, updateData);
    return this.getFloorPlan(id);
  }

  async deleteFloorPlan(id: string): Promise<void> {
    const existing = await this.floorPlanRepo.findById(id);
    if (!existing) throw new NotFoundException('Floor plan not found');
    await this.floorPlanRepo.delete(id);
  }

  async createClass(dto: CreateClassDto): Promise<ClassEntity> {
    const plan = await this.floorPlanRepo.findById(dto.floorPlanId);
    if (!plan) throw new NotFoundException('Floor plan not found');

    const model = await this.classRepo.create({
      name: dto.name,
      floorPlanId: dto.floorPlanId,
      assignments: (dto.assignments ?? []) as unknown as JsonValue,
      createdAt: now(),
      updatedAt: now(),
    });
    return toClass(model);
  }

  async getClasses(): Promise<ClassEntity[]> {
    const models = await this.classRepo.findAll();
    return models.map(toClass);
  }

  async getClass(id: string): Promise<ClassEntity> {
    const model = await this.classRepo.findById(id);
    if (!model) throw new NotFoundException('Class not found');
    return toClass(model);
  }

  async updateClass(id: string, dto: UpdateClassDto): Promise<ClassEntity> {
    const existing = await this.classRepo.findById(id);
    if (!existing) throw new NotFoundException('Class not found');

    const updateData: Record<string, unknown> = { updatedAt: now() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.floorPlanId !== undefined) updateData.floorPlanId = dto.floorPlanId;
    if (dto.assignments !== undefined)
      updateData.assignments = dto.assignments as unknown as JsonValue;

    await this.classRepo.update(id, updateData);
    return this.getClass(id);
  }

  async deleteClass(id: string): Promise<void> {
    const existing = await this.classRepo.findById(id);
    if (!existing) throw new NotFoundException('Class not found');
    await this.classRepo.delete(id);
  }
}
