export const formatDateLocal = (date: Date): string => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localISO = new Date(date.getTime() - tzOffset)
    .toISOString()
    .slice(0, 10);
  return localISO;
};
