import type { CalendarNoteModel } from '../interfaces/calendar.repository.interface.js';
import type { CalendarNoteEntity } from '../entities/calendar.entity.js';

export function toCalendarNote(model: CalendarNoteModel): CalendarNoteEntity {
  return {
    id: model.id,
    rteId: model.rteId,
    date: model.date,
    title: model.title,
    content: model.content ?? null,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
