import type { ModuleModel } from '../interfaces/module.repository.interface.js';
import type { ModuleEntity } from '../entities/module.entity.js';

export function toModule(model: ModuleModel): ModuleEntity {
  return {
    id: model.id,
    name: model.name,
    code: model.code ?? null,
    moduleLeader: model.moduleLeader,
    facultyId: model.facultyId,
    createdAt: model.createdAt as Date,
    updatedAt: model.updatedAt as Date,
  };
}
