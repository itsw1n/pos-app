import { fromDateId, toDateId } from '@marceloterreiro/flash-calendar';

export type DateFilter =
  | { type: 'all' }
  | { type: 'single'; date: Date }
  | { type: 'range'; from: Date; to: Date };

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function matchesDateFilter(filter: DateFilter, date: Date): boolean {
  const target = startOfDay(date).getTime();
  switch (filter.type) {
    case 'all':
      return true;
    case 'single':
      return startOfDay(filter.date).getTime() === target;
    case 'range':
      return (
        target >= startOfDay(filter.from).getTime() &&
        target <= startOfDay(filter.to).getTime()
      );
  }
}

export function toDateKey(date: Date): string {
  return toDateId(date);
}

export function fromDateKey(dateKey: string): Date {
  return fromDateId(dateKey);
}
