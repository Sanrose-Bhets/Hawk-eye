import type { AdmitCardModel } from '../interfaces/admit-card.repository.interface.js';
import type { AdmitCardEntity } from '../entities/admit-card.entity.js';

export function toAdmitCard(
  model: AdmitCardModel,
  enrichments?: {
    studentName?: string;
    studentEmail?: string;
    moduleName?: string;
    moduleCode?: string;
    facultyName?: string;
    examDate?: unknown;
    startTime?: string;
    endTime?: string;
    duration?: string;
  },
): AdmitCardEntity {
  return {
    id: model.id,
    studentId: model.studentId,
    examRoutineId: model.examRoutineId,
    seatNumber: model.seatNumber ?? undefined,
    roomName: model.roomName ?? undefined,
    pdfKey: model.pdfKey ?? undefined,
    generatedBy: model.generatedBy,
    studentName: enrichments?.studentName,
    studentEmail: enrichments?.studentEmail,
    moduleName: enrichments?.moduleName,
    moduleCode: enrichments?.moduleCode,
    facultyName: enrichments?.facultyName,
    examDate: enrichments?.examDate,
    startTime: enrichments?.startTime,
    endTime: enrichments?.endTime,
    duration: enrichments?.duration,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
