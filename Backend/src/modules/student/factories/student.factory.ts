import type { StudentModel } from '../interfaces/student.repository.interface.js';
import type { StudentEntity } from '../entities/student.entity.js';

export function toStudent(model: StudentModel): StudentEntity {
  return {
    id: model.id,
    name: model.name,
    email: model.email,
    address: model.address,
    contact: model.contact,
    parentEmail: model.parentEmail,
    image: model.image ?? null,
    role: model.role,
    facultyId: model.facultyId ?? null,
    semester: model.semester,
    createdAt: model.createdAt as Date,
    updatedAt: model.updatedAt as Date,
  };
}
