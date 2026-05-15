// Recent.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import RecentAnimedao from './RecentAnimedao';
import RecentKissanime from './RecentKissanime';
import Recent123Anime from './Recent123Anime';

type AnimeSource = '123anime' | 'kissanime' | 'animedao';

const SOURCES: { label: string; value: AnimeSource }[] = [
  { label: '123Anime',  value: '123anime'  },
  { label: 'KissAnime', value: 'kissanime' },
  { label: 'Animedao', value: 'animedao' },
];

export default function Recent() {
  const [activeSource, setActiveSource] = useState<AnimeSource>('animedao');
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeLabel = SOURCES.find((s) => s.value === activeSource)?.label ?? '';

  return (
    <div className="bg-black">
      {/* ── Header row with dropdown ── */}
      <div className="max-w-6xl mx-auto px-4 pt-6 flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="w-1 h-6 rounded-sm bg-red-500 inline-block" />
          <h1 className="text-white text-lg md:text-xl font-bold tracking-wide">
            Latest Release
          </h1>
        </div>

        {/* Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#12122a] border border-[#2a2a4a] rounded text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:border-gray-500 transition-colors min-w-[120px] justify-between"
          >
            <span>{activeLabel}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-1 w-36 bg-[#12122a] border border-[#2a2a4a] rounded overflow-hidden z-50 shadow-lg shadow-black/50">
              {SOURCES.map((src) => (
                <button
                  key={src.value}
                  onClick={() => {
                    setActiveSource(src.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
                    activeSource === src.value
                      ? 'bg-red-500 text-white'
                      : 'text-gray-400 hover:bg-[#1e1e3a] hover:text-white'
                  }`}
                >
                  {activeSource === src.value && (
                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                  <span className={activeSource === src.value ? '' : 'ml-5'}>
                    {src.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Rendered component ── */}
      {activeSource === '123anime'  && <Recent123Anime />}
      {activeSource === 'kissanime' && <RecentKissanime />}
      {activeSource === 'animedao' && <RecentAnimedao />}
    </div>
  );
}