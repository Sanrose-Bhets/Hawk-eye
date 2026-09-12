export interface FacultyModel {
  id: string;
  name: string;
  description: string | null;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface IFacultyRepository {
  create(data: {
    name: string;
    description?: string;
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<FacultyModel>;
  findAll(): Promise<FacultyModel[]>;
  findById(id: string): Promise<FacultyModel | null>;
  findByName(name: string): Promise<FacultyModel | null>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
