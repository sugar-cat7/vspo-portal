/**
 * Safely unwrap a nullable value for testing purposes.
 * Throws an error if the value is null or undefined.
 */
export function assertNonNull<T>(
  value: T | null | undefined,
  message?: string,
): T {
  if (value === null || value === undefined) {
    throw new Error(message || "Expected value to be non-null");
  }
  return value;
}

/**
 * Safely unwrap a nullable property from an object for testing purposes.
 * Throws an error if the property is null or undefined.
 */
export function assertNonNullProperty<T, K extends keyof T>(
  obj: T,
  property: K,
  message?: string,
): NonNullable<T[K]> {
  const value = obj[property];
  if (value === null || value === undefined) {
    throw new Error(
      message || `Expected property ${String(property)} to be non-null`,
    );
  }
  return value as NonNullable<T[K]>;
}
