import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { localDateKey, monthDays, upcomingByDate } from '../src/components/modules/meetingCalendar.ts';
import { MeetingCalendar } from '../src/components/modules/MeetingCalendar.tsx';

const meeting = (id, date, time, status = 'upcoming') => ({ id, date, time, status, title: id });

test('calendar uses local dates, correct month offsets and leap days', () => {
  assert.equal(localDateKey(new Date(2028, 1, 29, 23, 30)), '2028-02-29');
  const days = monthDays(new Date(2028, 1, 1));
  assert.equal(days[0], null);
  assert.equal(days[1], null);
  assert.equal(days[2], '2028-02-01');
  assert.equal(days.at(-1), '2028-02-29');
  assert.equal(monthDays(new Date(2027, 1, 1)).at(-1), '2027-02-28');
});

test('calendar groups upcoming meetings by date and orders same-day meetings by time', () => {
  const meetings = [
    meeting('late', '2028-02-29', '17:00'),
    meeting('early', '2028-02-29', '09:00'),
    meeting('finished', '2028-02-29', '08:00', 'completed'),
    meeting('next', '2028-03-01', '08:00'),
  ];
  const grouped = upcomingByDate(meetings);
  assert.deepEqual(grouped.get('2028-02-29').map(item => item.id), ['early', 'late']);
  const markup = renderToStaticMarkup(React.createElement(MeetingCalendar, {
    meetings, month: new Date(2028, 1, 1), selectedDate: '2028-02-29',
    onMonthChange() {}, onDateSelect() {},
  }));
  assert.match(markup, /2028-02-29, 2 upcoming meetings/);
  assert.match(markup, /aria-pressed="true"/);
  assert.match(markup, /Previous month/);
  assert.match(markup, /Next month/);
  assert.doesNotMatch(markup, /2028-03-01, 1 upcoming meeting/);
});
