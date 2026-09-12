import { User } from '../entities/auth.entity.js';

export function toUser(user: {
  id: string;
  email: string;
  role: string;
  facultyId?: string | null;
}): User {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    facultyId: user.facultyId ?? null,
  };
}
