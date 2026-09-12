import type {
  ResultModel,
  ResultItemModel,
} from '../interfaces/result.repository.interface.js';
import type {
  ResultEntity,
  ResultItemEntity,
} from '../entities/result.entity.js';

export function toResultItem(
  model: ResultItemModel,
  moduleName: string,
  moduleCode: string | null,
): ResultItemEntity {
  return {
    id: model.id,
    moduleId: model.moduleId,
    moduleName,
    moduleCode,
    score: model.score,
    grade: model.grade,
    createdAt: model.createdAt as Date,
  };
}

export function toResult(
  model: ResultModel,
  studentName: string,
  studentEmail: string,
  items: ResultItemEntity[],
): ResultEntity {
  return {
    id: model.id,
    studentId: model.studentId,
    studentName,
    studentEmail,
    published: model.published,
    items,
    createdAt: model.createdAt as Date,
    updatedAt: model.updatedAt as Date,
  };
}
