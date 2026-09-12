export interface ClassBookingModel {
  id: string;
  classId: string;
  bookedBy: string;
  purpose: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClassBookingRepository {
  create(data: {
    classId: string;
    bookedBy: string;
    purpose: string;
    startTime: Date;
    endTime: Date;
  }): Promise<ClassBookingModel>;
  findAll(filters?: { classId?: string; isActive?: boolean }): Promise<ClassBookingModel[]>;
  findById(id: string): Promise<ClassBookingModel | null>;
  findActiveByClassId(classId: string): Promise<ClassBookingModel | null>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  deactivateExpired(now: Date): Promise<number>;
}
