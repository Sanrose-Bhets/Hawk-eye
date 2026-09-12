export interface ResultItemModel {
  id: string;
  resultId: string;
  moduleId: string;
  score: number;
  grade: string;
  createdAt: unknown;
}

export interface ResultModel {
  id: string;
  studentId: string;
  published: boolean;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface IResultRepository {
  create(data: {
    studentId: string;
    published: boolean;
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<ResultModel>;

  findAll(): Promise<ResultModel[]>;

  findById(id: string): Promise<ResultModel | null>;

  findByStudentId(studentId: string): Promise<ResultModel | null>;

  update(id: string, data: Record<string, unknown>): Promise<void>;

  delete(id: string): Promise<void>;

  createItem(data: {
    resultId: string;
    moduleId: string;
    score: number;
    grade: string;
    createdAt: unknown;
  }): Promise<ResultItemModel>;

  findItemsByResultId(resultId: string): Promise<ResultItemModel[]>;

  deleteItemsByResultId(resultId: string): Promise<void>;
}
