import {
  addDays,
  differenceInMinutes,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isWithinInterval,
  max,
  min,
  parseISO,
  set,
  startOfDay,
  startOfToday
} from 'date-fns';

import type { EventModel } from '@/types';

export const PRESET_REMINDERS = [
  { label: '-24h', offsetMinutes: -24 * 60 },
  { label: '-2h', offsetMinutes: -2 * 60 },
  { label: '-15m', offsetMinutes: -15 }
];

export const TWO_WEEK_DAYS = 14;

export function getTwoWeekRange(base: Date = startOfToday()): Date[] {
  const start = startOfDay(base);
  return Array.from({ length: TWO_WEEK_DAYS }, (_, index) => addDays(start, index));
}

export function formatDayHeader(date: Date): string {
  return format(date, 'EEE MMM d');
}

export function formatDayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDateInput(value: string): string {
  const parsed = parseISO(value);
  return format(parsed, "yyyy-MM-dd'T'HH:mm");
}

export function formatDateOnlyInput(value: string): string {
  const parsed = parseISO(value);
  return format(parsed, 'yyyy-MM-dd');
}

export function formatTimeDisplay(value: string): string {
  return format(parseISO(value), 'h:mm a');
}

export function isEventOnDay(event: EventModel, day: Date): boolean {
  const start = parseISO(event.start);
  const end = parseISO(event.end);

  if (event.allDay) {
    return isSameDay(start, day) || isWithinInterval(day, { start, end });
  }

  return isSameDay(start, day) || isSameDay(end, day);
}

export function eventOverlapsRange(event: EventModel, rangeStart: Date, rangeEnd: Date): boolean {
  const start = parseISO(event.start);
  const end = parseISO(event.end);

  return (
    isWithinInterval(start, { start: rangeStart, end: rangeEnd }) ||
    isWithinInterval(end, { start: rangeStart, end: rangeEnd }) ||
    (isBefore(start, rangeStart) && isAfter(end, rangeEnd))
  );
}

export function parseWorkingTime(day: Date, time: string): Date {
  const [hourString, minuteString] = time.split(':');
  return set(day, {
    hours: Number(hourString),
    minutes: Number(minuteString),
    seconds: 0,
    milliseconds: 0
  });
}

export function getWorkingWindow(day: Date, workingHours: { start: string; end: string }) {
  const start = parseWorkingTime(day, workingHours.start);
  const end = parseWorkingTime(day, workingHours.end);
  return { start, end };
}

export function getWorkingMinutes(day: Date, workingHours: { start: string; end: string }): number {
  const { start, end } = getWorkingWindow(day, workingHours);
  return Math.max(60, differenceInMinutes(end, start));
}

export interface PositionedEventMeta {
  top: number;
  height: number;
}

export function getEventPosition(
  event: EventModel,
  day: Date,
  workingHours: { start: string; end: string }
): PositionedEventMeta {
  const { start: windowStart, end: windowEnd } = getWorkingWindow(day, workingHours);
  const totalMinutes = Math.max(1, differenceInMinutes(windowEnd, windowStart));

  const eventStart = parseISO(event.start);
  const eventEnd = parseISO(event.end);

  const clampedStart = max([eventStart, windowStart]);
  const clampedEnd = min([eventEnd, windowEnd]);

  const offset = Math.max(0, differenceInMinutes(clampedStart, windowStart));
  const heightMinutes = Math.max(15, differenceInMinutes(clampedEnd, windowStart) - offset);

  return {
    top: (offset / totalMinutes) * 100,
    height: (heightMinutes / totalMinutes) * 100
  };
}

export function eventsOverlap(a: EventModel, b: EventModel): boolean {
  if (a.allDay || b.allDay) {
    return false;
  }
  const startA = parseISO(a.start);
  const endA = parseISO(a.end);
  const startB = parseISO(b.start);
  const endB = parseISO(b.end);

  return startA < endB && startB < endA && isSameDay(startA, startB);
}

export function clampDateToDay(date: string, day: Date, workingHours: { start: string; end: string }): string {
  const parsed = parseISO(date);
  const { start, end } = getWorkingWindow(day, workingHours);

  if (isBefore(parsed, start)) {
    return start.toISOString();
  }

  if (isAfter(parsed, end)) {
    return end.toISOString();
  }

  return parsed.toISOString();
}
