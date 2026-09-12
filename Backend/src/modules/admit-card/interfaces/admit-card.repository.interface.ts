export interface AdmitCardModel {
  id: string;
  studentId: string;
  examRoutineId: string;
  seatNumber: string | null;
  roomName: string | null;
  pdfKey: string | null;
  generatedBy: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface IAdmitCardRepository {
  create(data: {
    studentId: string;
    examRoutineId: string;
    seatNumber?: string;
    roomName?: string;
    pdfKey?: string;
    generatedBy: string;
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<AdmitCardModel>;

  findAll(): Promise<AdmitCardModel[]>;

  findById(id: string): Promise<AdmitCardModel | null>;

  findByStudentId(studentId: string): Promise<AdmitCardModel[]>;

  findByExamRoutineId(examRoutineId: string): Promise<AdmitCardModel[]>;

  findUnique(studentId: string, examRoutineId: string): Promise<AdmitCardModel | null>;

  update(id: string, data: Record<string, unknown>): Promise<void>;

  delete(id: string): Promise<void>;
}
