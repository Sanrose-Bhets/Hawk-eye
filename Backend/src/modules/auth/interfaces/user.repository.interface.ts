import { Role } from '../constants/auth.constants.js';

export interface IUserRepository {
  findByEmail(email: string): Promise<{
    id: string;
    email: string;
    password: string;
    role: Role;
  } | null>;
}
