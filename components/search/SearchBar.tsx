"use client";

import { useState, useRef, useEffect } from "react";
import type { GeocodingResult } from "@/types/location";
import { useGeocode } from "@/hooks/useGeocode";
import Suggestions from "./Suggestions";

interface Props {
  onSelect: (result: GeocodingResult) => void;
}

export default function SearchBar({ onSelect }: Props) {
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const { results, isLoading } = useGeocode(searchQuery);
  const isOpen = results.length > 0 && searchQuery.length >= 2;

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setInputValue(v);
    setSearchQuery(v);
    setActiveIndex(-1);
  }

  function selectItem(item: GeocodingResult) {
    const label = [item.name, item.state, item.country]
      .filter(Boolean)
      .join(", ");
    setInputValue(label);
    setSearchQuery("");
    setActiveIndex(-1);
    onSelectRef.current(item);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length)
        selectItem(results[activeIndex]);
    } else if (e.key === "Escape") {
      setSearchQuery("");
    }
  }

  function clearSearch() {
    setInputValue("");
    setSearchQuery("");
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <label htmlFor="city-search" className="sr-only">
        Search for a city
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id="city-search"
          type="text"
          autoComplete="off"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search for a city…"
          aria-autocomplete="list"
          aria-controls={isOpen ? "city-autocomplete-list" : undefined}
          aria-activedescendant={
            activeIndex >= 0 ? `city-item-${activeIndex}` : undefined
          }
          aria-expanded={isOpen}
          role="combobox"
          className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3.5 sm:py-3 pl-10 pr-12 text-white placeholder-white/50 text-sm outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:border-white/40 transition-colors shadow-sm min-h-11"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/55"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {isLoading && (
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          >
            <div className="w-4 h-4 border-2 border-white/15 border-t-white/55 rounded-full animate-spin" />
          </div>
        )}
        {!isLoading && inputValue && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-lg text-white/55 cursor-pointer hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-colors"
            aria-label="Clear search"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <Suggestions
          items={results}
          activeIndex={activeIndex}
          onSelect={selectItem}
        />
      )}
    </div>
  );
}
