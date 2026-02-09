export const parseIntSafe = (
  value: unknown,
  defaultValue: number
): number => {
  if (typeof value !== 'string') {
    return defaultValue;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return defaultValue;
  }

  return parsed;
};