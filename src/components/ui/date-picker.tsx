"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatToday() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

interface DatePickerProps {
  value: string | null;
  onChange: (date: string | null) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = "Select date" }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const parsed = useMemo(() => value ? new Date(value + "T00:00:00Z") : null, [value]);

  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? new Date().getMonth());

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selectDate = useCallback((day: number) => {
    const d = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(d);
    setOpen(false);
  }, [viewYear, viewMonth, onChange]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);
  const today = useMemo(() => new Date(), []);

  const cells: { day: number; currentMonth: boolean; isToday: boolean; isSelected: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    cells.push({ day: d, currentMonth: false, isToday: false, isSelected: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && d === today.getDate();
    const isSelected = parsed
      ? viewYear === parsed.getFullYear() && viewMonth === parsed.getMonth() && d === parsed.getDate()
      : false;
    cells.push({ day: d, currentMonth: true, isToday, isSelected });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, currentMonth: false, isToday: false, isSelected: false });
  }

  const displayText = parsed
    ? parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
    : null;

  return (
    <div ref={containerRef} className="relative inline-block w-full">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) {
            if (parsed) {
              setViewYear(parsed.getFullYear());
              setViewMonth(parsed.getMonth());
            } else {
              const now = new Date();
              setViewYear(now.getFullYear());
              setViewMonth(now.getMonth());
            }
          }
        }}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer hover:bg-accent/50"
      >
        <span className={displayText ? "text-foreground" : "text-muted-foreground"}>
          {displayText ?? placeholder}
        </span>
        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1.5 w-[300px] rounded-xl border border-border bg-popover p-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Choose date"
        >
          {/* Month / Year nav */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); } else { setViewMonth((m) => m - 1); } }}
              className="size-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <select
                aria-label="Month"
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-transparent text-sm font-semibold text-foreground cursor-pointer focus:outline-none appearance-none px-1 py-0.5 rounded hover:bg-muted transition-colors"
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i} className="bg-popover text-popover-foreground">{m}</option>
                ))}
              </select>
              <select
                aria-label="Year"
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-transparent text-sm font-semibold text-foreground cursor-pointer focus:outline-none appearance-none px-1 py-0.5 rounded hover:bg-muted transition-colors"
              >
                {Array.from({ length: 150 }, (_, i) => today.getFullYear() - i).map((y) => (
                  <option key={y} value={y} className="bg-popover text-popover-foreground">{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); } else { setViewMonth((m) => m + 1); } }}
              className="size-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => (
              <button
                key={i}
                type="button"
                disabled={!cell.currentMonth}
                aria-label={`${MONTHS[viewMonth]} ${cell.day}, ${viewYear}`}
                onClick={() => cell.currentMonth && selectDate(cell.day)}
                className={`
                  relative h-8 w-full flex items-center justify-center text-sm rounded-lg transition-all duration-150 cursor-pointer
                  ${!cell.currentMonth ? "text-muted-foreground/30 cursor-default" : "text-foreground hover:bg-muted"}
                  ${cell.isToday && !cell.isSelected ? "font-bold text-primary" : ""}
                  ${cell.isSelected ? "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/25" : ""}
                `}
              >
                {cell.day}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
            {value ? (
              <button
                type="button"
                onClick={() => { onChange(null); setOpen(false); }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer px-2 py-1 rounded hover:bg-destructive/10"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            ) : (
              <div />
            )}
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const todayStr = formatToday();
                setViewYear(now.getFullYear());
                setViewMonth(now.getMonth());
                onChange(todayStr);
                setOpen(false);
              }}
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-primary/10"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
