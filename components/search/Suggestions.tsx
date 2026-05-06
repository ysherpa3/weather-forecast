import type { GeocodingResult } from "@/types/location";

interface Props {
  items: GeocodingResult[];
  activeIndex: number;
  onSelect: (item: GeocodingResult) => void;
}

export default function Suggestions({ items, activeIndex, onSelect }: Props) {
  if (items.length === 0) return null;

  return (
    <ul
      id="city-autocomplete-list"
      role="listbox"
      aria-label="City suggestions"
      className="absolute z-50 top-full mt-1.5 w-full rounded-xl bg-[rgba(10,14,22,0.92)] backdrop-blur-xl border border-white/10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
    >
      {items.map((item, index) => (
        <li
          key={index}
          id={`city-item-${index}`}
          role="option"
          aria-selected={index === activeIndex}
          onMouseDown={() => onSelect(item)}
          className={`flex items-center gap-3 px-4 py-3 min-h-11 cursor-pointer transition-colors text-sm ${
            index === activeIndex ? "bg-white/15" : "hover:bg-white/10"
          }`}
        >
          <svg
            className="w-3.5 h-3.5 text-amber-400/80 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-white">
            <span className="font-medium">{item.name}</span>
            {item.state && (
              <span className="text-white/55">, {item.state}</span>
            )}
            <span className="text-white/55">, {item.country}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
