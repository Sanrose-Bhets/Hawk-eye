export interface EmailLogModel {
  id: string;
  to: string;
  subject: string;
  body: string;
  studentId: string | null;
  teacherId: string | null;
  status: string;
  error: string | null;
  createdAt: unknown;
}

export interface IMailRepository {
  create(data: {
    to: string;
    subject: string;
    body: string;
    studentId?: string;
    teacherId?: string;
    status: string;
    createdAt: unknown;
  }): Promise<EmailLogModel>;

  findAll(): Promise<EmailLogModel[]>;

  findById(id: string): Promise<EmailLogModel | null>;

  update(id: string, data: Record<string, unknown>): Promise<void>;

  count(): Promise<number>;

  countByStatus(status: string): Promise<number>;
}
