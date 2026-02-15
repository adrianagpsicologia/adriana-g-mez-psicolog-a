import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

interface BookingCalendarProps {
  availableDates: Date[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const BookingCalendar = ({ availableDates, selectedDate, onSelectDate }: BookingCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Start at the month of the first available date, or current month
    return availableDates.length > 0 ? startOfMonth(availableDates[0]) : startOfMonth(new Date());
  });

  const today = startOfDay(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  // Week starts on Monday (weekStartsOn: 1)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Build array of days
  const days: Date[] = [];
  let day = calendarStart;
  while (isBefore(day, addDays(calendarEnd, 1))) {
    days.push(day);
    day = addDays(day, 1);
  }

  const isAvailable = (date: Date) =>
    availableDates.some((d) => isSameDay(d, date));

  const isPast = (date: Date) => isBefore(date, today);

  // Check if there are available dates in previous/next months
  const prevMonth = subMonths(currentMonth, 1);
  const nextMonth = addMonths(currentMonth, 1);
  const hasPrevDates = availableDates.some((d) => isSameMonth(d, prevMonth));
  const hasNextDates = availableDates.some((d) => isSameMonth(d, nextMonth) || isSameMonth(d, addMonths(nextMonth, 1)));

  return (
    <div className="w-full max-w-md">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(prevMonth)}
          disabled={!hasPrevDates}
          className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-heading text-lg font-medium capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h3>
        <button
          onClick={() => setCurrentMonth(nextMonth)}
          disabled={!hasNextDates}
          className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-center text-xs font-medium text-muted-foreground py-2">
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const inMonth = isSameMonth(d, currentMonth);
          const available = isAvailable(d);
          const selected = selectedDate && isSameDay(d, selectedDate);
          const past = isPast(d);

          return (
            <button
              key={i}
              onClick={() => available && onSelectDate(d)}
              disabled={!available}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm transition-all
                ${!inMonth ? "opacity-0 pointer-events-none" : ""}
                ${selected
                  ? "bg-foreground text-background font-medium shadow-md"
                  : available
                    ? "hover:bg-accent cursor-pointer font-medium"
                    : past || !inMonth
                      ? "text-muted-foreground/30 cursor-not-allowed"
                      : "text-muted-foreground/40 cursor-not-allowed"
                }
              `}
            >
              {inMonth ? format(d, "d") : ""}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-foreground" />
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-foreground/40" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-muted-foreground/20" />
          <span>No disponible</span>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
