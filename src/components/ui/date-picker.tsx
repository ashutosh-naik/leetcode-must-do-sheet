"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, X, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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

function DropdownSelect({
  value,
  options,
  labels,
  onChange,
  ariaLabel,
  width,
}: {
  value: number;
  options: number[];
  labels: string[];
  onChange: (val: number) => void;
  ariaLabel: string;
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selectedIdx = options.indexOf(value);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setHighlightedIndex((i) => Math.min(i + 1, options.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setHighlightedIndex((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && highlightedIndex >= 0) { e.preventDefault(); onChange(options[highlightedIndex]); setOpen(false); }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, highlightedIndex, options, onChange]);

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const openDropdown = useCallback(() => {
    setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    setOpen(true);
  }, [selectedIdx]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            openDropdown();
          }
        }}
        aria-label={ariaLabel}
        className={cn(
          "flex items-center gap-1 text-sm font-semibold text-foreground cursor-pointer px-2 py-0.5 rounded-lg transition-all duration-150",
          "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
          open && "bg-muted",
          width,
        )}
      >
        <span className="truncate">{labels[selectedIdx] ?? value}</span>
        <ChevronDown className={cn("h-3 w-3 text-muted-foreground shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div
          className="absolute z-[60] mt-1.5 min-w-[140px] max-h-[240px] overflow-y-auto rounded-xl border border-border bg-popover py-1 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150"
          role="listbox"
          aria-label={ariaLabel}
          ref={listRef}
        >
          {options.map((opt, i) => {
            const isSelected = opt === value;
            const isHighlighted = i === highlightedIndex;
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => { onChange(opt); setOpen(false); }}
                onMouseEnter={() => setHighlightedIndex(i)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-1.5 text-sm cursor-pointer transition-colors duration-100 text-left",
                  isHighlighted && "bg-muted",
                  isSelected ? "text-primary font-semibold" : "text-foreground",
                )}
              >
                <span className="truncate">{labels[i]}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
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
  const todayYear = new Date().getFullYear();
  const todayMonth = new Date().getMonth();
  const todayDate = new Date().getDate();

  const cells: { day: number; currentMonth: boolean; isToday: boolean; isSelected: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    cells.push({ day: d, currentMonth: false, isToday: false, isSelected: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = viewYear === todayYear && viewMonth === todayMonth && d === todayDate;
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

  const yearOptions = useMemo(() => Array.from({ length: 150 }, (_, i) => todayYear - i), [todayYear]);
  const yearLabels = useMemo(() => yearOptions.map(String), [yearOptions]);
  const monthOptions = useMemo(() => MONTHS.map((_, i) => i), []);
  const monthLabels = useMemo(() => [...MONTHS], []);

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
        className="flex h-9 w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-1 text-sm transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 cursor-pointer hover:border-primary/40 hover:bg-accent/50"
      >
        <span className={displayText ? "text-foreground" : "text-muted-foreground"}>
          {displayText ?? placeholder}
        </span>
        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1.5 w-[300px] rounded-2xl border border-border bg-popover p-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
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

            <div className="flex items-center gap-0.5">
              <DropdownSelect
                value={viewMonth}
                options={monthOptions}
                labels={monthLabels}
                onChange={setViewMonth}
                ariaLabel="Month"
              />
              <DropdownSelect
                value={viewYear}
                options={yearOptions}
                labels={yearLabels}
                onChange={setViewYear}
                ariaLabel="Year"
              />
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
                className={cn(
                  "relative h-8 w-full flex items-center justify-center text-sm rounded-lg transition-all duration-150 cursor-pointer",
                  !cell.currentMonth && "text-muted-foreground/30 cursor-default",
                  cell.currentMonth && !cell.isSelected && "text-foreground hover:bg-muted",
                  cell.isToday && !cell.isSelected && "font-bold text-primary",
                  cell.isSelected && "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/25",
                )}
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
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-destructive/10"
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
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-primary/10"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
