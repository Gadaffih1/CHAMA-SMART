import type { Meeting } from '../../types';

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function monthDays(month: Date): (string | null)[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const offset = new Date(year, monthIndex, 1).getDay();
  const count = new Date(year, monthIndex + 1, 0).getDate();
  return [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: count }, (_, index) => localDateKey(new Date(year, monthIndex, index + 1))),
  ];
}

export function upcomingByDate(meetings: Meeting[]): Map<string, Meeting[]> {
  const byDate = new Map<string, Meeting[]>();
  for (const meeting of meetings) {
    if (meeting.status !== 'upcoming') continue;
    const day = byDate.get(meeting.date) || [];
    day.push(meeting);
    byDate.set(meeting.date, day);
  }
  for (const day of byDate.values()) {
    day.sort((a, b) => a.time.localeCompare(b.time) || a.title.localeCompare(b.title));
  }
  return byDate;
}
