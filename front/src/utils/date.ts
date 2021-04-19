import type { LinkModel } from "../model/link-model";

export function getDateParsed(link: LinkModel) {
  const date = new Date(link.date);
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

export function parseDate(date: string) {
  return new Date(date);
}

export function parseDateAndTime(date: string) {
  const aDate = parseDate(date);

  return `${aDate.toLocaleDateString()}, ${aDate.getHours()}:${aDate.getMinutes()}`;
}
