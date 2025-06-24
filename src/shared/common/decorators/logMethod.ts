// Example: Custom decorator for logging method calls
export function LogMethod(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with`, args);
    return originalMethod.apply(this, args);
  };
  return descriptor;
}

// Example: Decorator to mark a method as deprecated
export function Deprecated(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.warn(`Warning: ${propertyKey} is deprecated.`);
    return originalMethod.apply(this, args);
  };
  return descriptor;
}
