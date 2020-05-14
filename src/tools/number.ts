export const positiveNumber = (value: number|string): boolean => {
  if (typeof value === 'string') {
    return parseFloat(value) > 0;
  }
  return value > 0;
};

export default {
  positive: positiveNumber,
};
