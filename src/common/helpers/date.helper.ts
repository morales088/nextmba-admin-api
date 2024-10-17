import { DateTime } from 'luxon';

export const now = () => DateTime.now().toUTC();

export function currentTime() {
  return now().toJSDate();
}

export const startOfDay = (date = currentTime()) => {
  const startOfDay = DateTime.fromJSDate(date).toUTC().startOf('day');
  return new Date(startOfDay.toJSDate());
};

export const endOfDay = (date = currentTime()) => {
  const endOfDay = DateTime.fromJSDate(date).toUTC().endOf('day');
  return new Date(endOfDay.toJSDate());
};

export const last24Hours = () => {
  const startOfLast24Hours = DateTime.utc().minus({ hours: 24 });
  return new Date(startOfLast24Hours.toJSDate());
};

export const previousDay = (date = currentTime()) => {
  const previousDay = DateTime.fromJSDate(date).minus({ day: 1 });
  return new Date(previousDay.toJSDate());
};

export const previousStartOfDay = (date = currentTime()) => {
  const previousDay = DateTime.fromJSDate(date).minus({ day: 1 }).startOf('day');
  return new Date(previousDay.toJSDate());
};

export const previousEndOfDay = (date = currentTime()) => {
  const previousDay = DateTime.fromJSDate(date).minus({ day: 1 }).endOf('day');
  return new Date(previousDay.toJSDate());
};

export const firstDayOfWeek = (date = currentTime()) => {
  return new Date(DateTime.fromJSDate(date).toUTC().startOf('week').toISODate());
};

export const lastDayOfWeek = (date = currentTime()) => {
  const lastDayOfWeek = DateTime.fromJSDate(date).toUTC().endOf('week');
  return new Date(lastDayOfWeek.toJSDate().setUTCHours(23, 59, 59, 999));
};

export const startDayOfMonth = (date = currentTime()) => {
  return new Date(DateTime.fromJSDate(date).toUTC().startOf('month').toISODate());
};

export const endDayOfMonth = (date = currentTime()) => {
  const endOfMonth = DateTime.fromJSDate(date).toUTC().plus({ weeks: 1 }).endOf('month');
  return new Date(endOfMonth.toJSDate().setUTCHours(23, 59, 59, 999));
};

export const lastNumMonth = (numMonths: number, date = currentTime()) => {
  const oneMonthAgo = DateTime.fromJSDate(date).minus({ months: numMonths });
  return new Date(oneMonthAgo.toJSDate());
};

export const delayMs = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
