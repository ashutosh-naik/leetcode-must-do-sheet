"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { MapPin } from "lucide-react";
import { CITIES } from "@/constants/cities";

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "i");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-transparent text-primary font-semibold">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

interface LocationInputProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function LocationInput({ value, onChange }: LocationInputProps) {
  const [query, setQuery] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [activeItemId] = useState(() => `location-option-${Math.random().toString(36).slice(2, 8)}`);

  const filtered = useMemo(() => {
    if (!query || query.length < 1) return [];
    const lower = query.toLowerCase();
    return CITIES.filter((c) => {
      const cl = c.toLowerCase();
      if (cl.startsWith(lower)) return true;
      const commaIdx = cl.lastIndexOf(", ");
      if (commaIdx !== -1) {
        const country = cl.slice(commaIdx + 2);
        if (country.startsWith(lower)) return true;
      }
      return false;
    }).slice(0, 10);
  }, [query]);

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

  const selectCity = useCallback((city: string) => {
    setQuery(city);
    onChange(city);
    setOpen(false);
    inputRef.current?.blur();
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === "ArrowDown" || e.key === "Enter") {
          setOpen(true);
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) => (i < filtered.length - 1 ? i + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) => (i > 0 ? i - 1 : filtered.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          selectCity(filtered[highlightedIndex]);
        }
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [open, filtered, highlightedIndex, selectCity],
  );

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setHighlightedIndex(-1); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a city..."
          aria-label="Search for a city"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={activeItemId}
          aria-activedescendant={highlightedIndex >= 0 ? `${activeItemId}-${highlightedIndex}` : undefined}
          className="flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {open && filtered.length > 0 && (
        <div
          ref={listRef}
          id={activeItemId}
          role="listbox"
          aria-label="City suggestions"
          className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-popover py-1 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150 max-h-[240px] overflow-y-auto"
        >
          {filtered.map((city, i) => (
            <button
              key={city}
              id={`${activeItemId}-${i}`}
              type="button"
              role="option"
              aria-selected={i === highlightedIndex}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectCity(city)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
                i === highlightedIndex
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <MapPin className={`h-3.5 w-3.5 shrink-0 ${i === highlightedIndex ? "text-primary" : "text-muted-foreground"}`} />
              <span className="truncate">
                <HighlightText text={city} query={query} />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
