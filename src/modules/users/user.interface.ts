// Example: Define a common user type for use across modules
export interface IUser {
  id: number;
  email?: string;
  phone?: string;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Example: Add a shared enum for user roles
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest",
}

// Example: Add a shared type for API response
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

// Example: Add a shared type for paginated results
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Example: Add a shared type for JWT payload
export interface JwtPayload {
  userId: number;
  email?: string;
  role?: UserRole;
  iat?: number;
  exp?: number;
}
