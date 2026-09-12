export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const JWT_ACCESS_EXPIRY = '15m';
export const JWT_REFRESH_EXPIRY = '7d';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type Role = 'STUDENT' | 'STUDENT_SERVICE' | 'RTE';
