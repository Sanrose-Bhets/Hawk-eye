import type {
  TeacherModel,
  TeacherWithRelations,
} from '../interfaces/teacher.repository.interface.js';
import type { TeacherEntity } from '../entities/teacher.entity.js';

export function toTeacher(
  model: TeacherModel | TeacherWithRelations,
): TeacherEntity {
  const withRelations = model as TeacherWithRelations;
  return {
    id: model.id,
    name: model.name,
    email: model.email,
    facultyIds: withRelations.facultyIds ?? [],
    moduleIds: withRelations.moduleIds ?? [],
    createdAt: model.createdAt as Date,
    updatedAt: model.updatedAt as Date,
  };
}
