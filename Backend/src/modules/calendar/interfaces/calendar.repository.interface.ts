export interface CalendarNoteModel {
  id: string;
  rteId: string;
  date: unknown;
  title: string;
  content: string | null;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface ICalendarRepository {
  create(data: {
    rteId: string;
    date: unknown;
    title: string;
    content?: string;
    createdAt: unknown;
    updatedAt: unknown;
  }): Promise<CalendarNoteModel>;

  findAll(): Promise<CalendarNoteModel[]>;

  findById(id: string): Promise<CalendarNoteModel | null>;

  update(id: string, data: Record<string, unknown>): Promise<void>;

  delete(id: string): Promise<void>;
}
