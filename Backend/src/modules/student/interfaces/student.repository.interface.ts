export interface StudentModel {
  id: string;
  name: string;
  email: string;
  password: string;
  address: string;
  contact: string;
  parentEmail: string;
  image: string | null;
  role: string;
  facultyId: string | null;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface IStudentRepository {
  create(data: {
    name: string;
    email: string;
    password: string;
    address: string;
    contact: string;
    parentEmail: string;
    facultyId: string;
    role: 'STUDENT' | 'STUDENT_SERVICE' | 'RTE';
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<StudentModel>;
  findAll(): Promise<StudentModel[]>;
  findById(id: string): Promise<StudentModel | null>;
  findByEmail(email: string): Promise<StudentModel | null>;
  count(): Promise<number>;
  update(id: string, data: Record<string, unknown>): Promise<void>;
  delete(id: string): Promise<void>;
}
