"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { MapPin } from "lucide-react";

const CITIES = [
  "Pune, India", "Mumbai, India", "Delhi, India", "Bangalore, India", "Hyderabad, India",
  "Chennai, India", "Kolkata, India", "Ahmedabad, India", "Jaipur, India", "Lucknow, India",
  "Surat, India", "Indore, India", "Bhopal, India", "Nagpur, India", "Patna, India",
  "Vadodara, India", "Visakhapatnam, India", "Thiruvananthapuram, India", "Coimbatore, India",
  "Ludhiana, India", "Agra, India", "Nashik, India", "Meerut, India", "Rajkot, India",
  "Varanasi, India", "Aurangabad, India", "Dhanbad, India", "Amritsar, India", "Noida, India",
  "London, United Kingdom", "Manchester, United Kingdom", "Birmingham, United Kingdom",
  "Edinburgh, United Kingdom", "Glasgow, United Kingdom", "Liverpool, United Kingdom",
  "New York, United States", "San Francisco, United States", "Los Angeles, United States",
  "Chicago, United States", "Houston, United States", "Phoenix, United States",
  "Austin, United States", "Seattle, United States", "Boston, United States",
  "Denver, United States", "Miami, United States", "Atlanta, United States",
  "San Diego, United States", "Portland, United States", "Dallas, United States",
  "Toronto, Canada", "Vancouver, Canada", "Montreal, Canada", "Ottawa, Canada",
  "Sydney, Australia", "Melbourne, Australia", "Brisbane, Australia", "Perth, Australia",
  "Tokyo, Japan", "Osaka, Japan", "Kyoto, Japan", "Yokohama, Japan",
  "Seoul, South Korea", "Busan, South Korea", "Incheon, South Korea",
  "Beijing, China", "Shanghai, China", "Shenzhen, China", "Guangzhou, China", "Chengdu, China",
  "Singapore, Singapore", "Hong Kong, Hong Kong", "Taipei, Taiwan",
  "Dubai, UAE", "Abu Dhabi, UAE", "Sharjah, UAE",
  "Berlin, Germany", "Munich, Germany", "Frankfurt, Germany", "Hamburg, Germany",
  "Paris, France", "Lyon, France", "Marseille, France", "Nice, France",
  "Amsterdam, Netherlands", "Rotterdam, Netherlands", "The Hague, Netherlands",
  "Barcelona, Spain", "Madrid, Spain", "Valencia, Spain", "Seville, Spain",
  "Rome, Italy", "Milan, Italy", "Naples, Italy", "Turin, Italy",
  "São Paulo, Brazil", "Rio de Janeiro, Brazil", "Brasília, Brazil", "Salvador, Brazil",
  "Mexico City, Mexico", "Guadalajara, Mexico", "Monterrey, Mexico",
  "Buenos Aires, Argentina", "Córdoba, Argentina", "Rosario, Argentina",
  "Cairo, Egypt", "Alexandria, Egypt",
  "Cape Town, South Africa", "Johannesburg, South Africa", "Durban, South Africa",
  "Nairobi, Kenya", "Lagos, Nigeria", "Accra, Ghana",
  "Istanbul, Turkey", "Ankara, Turkey", "Izmir, Turkey",
  "Bangkok, Thailand", "Chiang Mai, Thailand", "Pattaya, Thailand",
  "Hanoi, Vietnam", "Ho Chi Minh City, Vietnam", "Da Nang, Vietnam",
  "Kuala Lumpur, Malaysia", "George Town, Malaysia", "Johor Bahru, Malaysia",
  "Jakarta, Indonesia", "Bali, Indonesia", "Surabaya, Indonesia",
  "Manila, Philippines", "Cebu, Philippines", "Quezon City, Philippines",
  "Kathmandu, Nepal", "Pokhara, Nepal",
  "Colombo, Sri Lanka", "Kandy, Sri Lanka",
  "Dhaka, Bangladesh", "Chittagong, Bangladesh",
  "Lahore, Pakistan", "Karachi, Pakistan", "Islamabad, Pakistan", "Rawalpindi, Pakistan",
  "Stockholm, Sweden", "Gothenburg, Sweden",
  "Oslo, Norway", "Bergen, Norway",
  "Copenhagen, Denmark",
  "Helsinki, Finland",
  "Zurich, Switzerland", "Geneva, Switzerland", "Bern, Switzerland",
  "Vienna, Austria", "Salzburg, Austria",
  "Prague, Czech Republic", "Brno, Czech Republic",
  "Warsaw, Poland", "Kraków, Poland", "Wrocław, Poland",
  "Budapest, Hungary",
  "Bucharest, Romania", "Cluj-Napoca, Romania",
  "Athens, Greece", "Thessaloniki, Greece",
  "Lisbon, Portugal", "Porto, Portugal",
  "Dublin, Ireland",
  "Brussels, Belgium",
  "Santiago, Chile", "Lima, Peru", "Bogotá, Colombia", "Quito, Ecuador",
  "Moscow, Russia", "Saint Petersburg, Russia",
  "Kyiv, Ukraine",
  "Tbilisi, Georgia",
  "Reykjavik, Iceland",
  "Queenstown, New Zealand", "Auckland, New Zealand", "Wellington, New Zealand",
  "Doha, Qatar", "Riyadh, Saudi Arabia", "Jeddah, Saudi Arabia",
  "Amman, Jordan",
  "Beirut, Lebanon",
  "Casablanca, Morocco", "Marrakech, Morocco",
];

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

  const filtered = useMemo(() => {
    if (!query || query.length < 1) return [];
    const lower = query.toLowerCase();
    return CITIES.filter((c) => c.toLowerCase().startsWith(lower)).slice(0, 8);
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
          className="flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {open && filtered.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-popover py-1 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150 max-h-[240px] overflow-y-auto"
        >
          {filtered.map((city, i) => (
            <button
              key={city}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectCity(city)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
                i === highlightedIndex
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <MapPin className={`h-3.5 w-3.5 shrink-0 ${i === highlightedIndex ? "text-primary" : "text-muted-foreground"}`} />
              <span
                className="truncate"
                dangerouslySetInnerHTML={{
                  __html: city.replace(
                    new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "i"),
                    '<mark class="bg-transparent text-primary font-semibold">$1</mark>',
                  ),
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
