// Example: Generic API response type
export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
};

// Example: Utility type for making all properties optional
export type Optional<T> = {
  [P in keyof T]?: T[P];
};

// Example: Utility type for extracting value types from an object
export type ValueOf<T> = T[keyof T];
