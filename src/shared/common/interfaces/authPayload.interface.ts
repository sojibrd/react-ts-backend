// Example: Auth payload interface
export interface IAuthPayload {
  userId: number;
  email: string;
  role: string;
}

// Example: Interface for paginated query params
export interface IPaginationQuery {
  page?: number;
  pageSize?: number;
}

// Example: Interface for a generic entity with an ID
export interface IEntity {
  id: number;
}
