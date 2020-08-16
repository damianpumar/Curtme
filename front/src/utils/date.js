export function getDateParsed(link) {
  const date = new Date(link.date);
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}
export function parseDate(dateString) {
  return new Date(dateString);
}

export function parseDateAndTime(dateString) {
  const date = parseDate(dateString);

  return `${date.toLocaleDateString()}, ${date.getHours()}:${date.getMinutes()}`;
}
