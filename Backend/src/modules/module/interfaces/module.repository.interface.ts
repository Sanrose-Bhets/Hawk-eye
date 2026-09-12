export interface ModuleModel {
  id: string;
  name: string;
  code: string | null;
  moduleLeader: string;
  facultyId: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface IModuleRepository {
  create(data: {
    name: string;
    code?: string;
    moduleLeader: string;
    facultyId: string;
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<ModuleModel>;
  findAll(): Promise<ModuleModel[]>;
  findById(id: string): Promise<ModuleModel | null>;
  findByFacultyId(facultyId: string): Promise<ModuleModel[]>;
  count(): Promise<number>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
