// Example: User roles constant
export const USER_ROLES = ["admin", "user", "guest"] as const;

// Example: HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Example: App environment constants
export const ENVIRONMENTS = ["development", "production", "test"] as const;
