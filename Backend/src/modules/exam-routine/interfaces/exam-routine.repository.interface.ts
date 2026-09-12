export interface ExamRoutineModel {
  id: string;
  rteId: string;
  date: unknown;
  startTime: string;
  endTime: string;
  duration: string;
  facultyId: string;
  moduleId: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface IExamRoutineRepository {
  create(data: {
    rteId: string;
    date: unknown;
    startTime: string;
    endTime: string;
    duration: string;
    facultyId: string;
    moduleId: string;
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<ExamRoutineModel>;

  findAll(): Promise<ExamRoutineModel[]>;

  findById(id: string): Promise<ExamRoutineModel | null>;

  update(id: string, data: Record<string, unknown>): Promise<void>;

  delete(id: string): Promise<void>;
}
