import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Meeting } from '../../types';
import { localDateKey, monthDays, upcomingByDate } from './meetingCalendar';

interface MeetingCalendarProps {
  meetings: Meeting[];
  month: Date;
  selectedDate: string | null;
  onMonthChange: (month: Date) => void;
  onDateSelect: (date: string | null) => void;
}

export const MeetingCalendar: React.FC<MeetingCalendarProps> = ({
  meetings, month, selectedDate, onMonthChange, onDateSelect,
}) => {
  const byDate = upcomingByDate(meetings);
  const today = localDateKey(new Date());
  const changeMonth = (offset: number) => {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + offset, 1));
    onDateSelect(null);
  };

  return (
    <section className="bg-white rounded-2xl border border-emerald-100 shadow-xs p-4" aria-label="Upcoming meetings calendar">
      <div className="flex items-center justify-between gap-2">
        <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} className="p-2 rounded-lg hover:bg-emerald-50">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-bold text-sm text-slate-900" aria-live="polite">
          {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </h3>
        <button type="button" aria-label="Next month" onClick={() => changeMonth(1)} className="p-2 rounded-lg hover:bg-emerald-50">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-500 mt-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day}>{day}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-1">
        {monthDays(month).map((date, index) => {
          if (!date) return <span key={`empty-${index}`} />;
          const count = byDate.get(date)?.length || 0;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onDateSelect(selectedDate === date ? null : date)}
              aria-label={`${date}, ${count} upcoming ${count === 1 ? 'meeting' : 'meetings'}`}
              aria-pressed={selectedDate === date}
              aria-current={date === today ? 'date' : undefined}
              className={`min-h-11 rounded-lg text-xs flex flex-col items-center justify-center ${
                selectedDate === date ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-50 text-slate-800'
              } ${date === today ? 'ring-1 ring-emerald-500' : ''}`}
            >
              <span>{Number(date.slice(-2))}</span>
              {count > 0 && <span className="text-[9px] font-bold">{count} {count === 1 ? 'meeting' : 'meetings'}</span>}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between items-center mt-3 text-xs">
        <span className="text-slate-500">Upcoming meetings</span>
        <button type="button" className="font-semibold text-emerald-700" onClick={() => {
          onMonthChange(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
          onDateSelect(null);
        }}>Today</button>
      </div>
    </section>
  );
};
