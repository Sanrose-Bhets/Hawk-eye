export interface TeacherModel {
  id: string;
  name: string;
  email: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface TeacherWithRelations extends TeacherModel {
  facultyIds: string[];
  moduleIds: string[];
}

export interface ITeacherRepository {
  create(data: {
    name: string;
    email: string;
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<TeacherModel>;
  findAll(): Promise<TeacherWithRelations[]>;
  findById(id: string): Promise<TeacherWithRelations | null>;
  findByEmail(email: string): Promise<TeacherWithRelations | null>;
  findByModuleId(moduleId: string): Promise<TeacherWithRelations[]>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
  setFaculties(teacherId: string, facultyIds: string[]): Promise<void>;
  setModules(teacherId: string, moduleIds: string[]): Promise<void>;
}
