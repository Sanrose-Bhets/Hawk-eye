import type { FacultyModel } from '../interfaces/faculty.repository.interface.js';
import type { FacultyEntity } from '../entities/faculty.entity.js';

export function toFaculty(model: FacultyModel): FacultyEntity {
  return {
    id: model.id,
    name: model.name,
    description: model.description ?? null,
    createdAt: model.createdAt as Date,
    updatedAt: model.updatedAt as Date,
  };
}
