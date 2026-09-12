import type { ExamRoutineModel } from '../interfaces/exam-routine.repository.interface.js';
import type { ExamRoutineEntity } from '../entities/exam-routine.entity.js';

export function toExamRoutine(
  model: ExamRoutineModel,
  moduleName?: string,
  facultyName?: string,
): ExamRoutineEntity {
  return {
    id: model.id,
    rteId: model.rteId,
    date: model.date,
    startTime: model.startTime,
    endTime: model.endTime,
    duration: model.duration,
    facultyId: model.facultyId,
    moduleId: model.moduleId,
    moduleName,
    facultyName,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
