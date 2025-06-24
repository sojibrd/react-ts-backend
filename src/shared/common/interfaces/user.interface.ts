// Shared user types and enums for project-wide use
export interface IUser {
  id: number;
  email?: string;
  phone?: string;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest",
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface JwtPayload {
  userId: number;
  email?: string;
  role?: UserRole;
  iat?: number;
  exp?: number;
}
