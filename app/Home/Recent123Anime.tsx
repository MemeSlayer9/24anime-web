'use client';

import React, { useReducer, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface AnimeItem {
  slug: string;
  title: string;
  cover: string;
  latestEpisode: number;
  episodeId: string;
  status: string;
  url: string;
}

type AnimeCategory = 'subbed-anime' | 'dubbed-anime' | 'chinese-anime';

type FetchState = { items: AnimeItem[]; loading: boolean };
type FetchAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: AnimeItem[] }
  | { type: 'FETCH_ERROR' };

function fetchReducer(_state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case 'FETCH_START':   return { items: [], loading: true };
    case 'FETCH_SUCCESS': return { items: action.payload, loading: false };
    case 'FETCH_ERROR':   return { items: [], loading: false };
  }
}

const API_KEY = 'fuckyoubitch';
const BASE_URL = 'https://sad-ebon-nine.vercel.app/anime/123anime/recent';

const CATEGORIES: { label: string; value: AnimeCategory }[] = [
  { label: 'SUB',     value: 'subbed-anime'  },
  { label: 'DUB',     value: 'dubbed-anime'  },
  { label: 'CHINESE', value: 'chinese-anime' },
];

/* ── Badge colour map ── */
const STATUS_COLORS: Record<string, string> = {
  'Completed': 'bg-green-600',
  'Ongoing':   'bg-blue-600',
  'ONA':       'bg-purple-600',
};

export default function AnimeEpisodesGrid() {
  const router = useRouter();

  const [{ items, loading }, dispatch] = useReducer(fetchReducer, {
    items: [],
    loading: true,
  });

  const [currentPage, setCurrentPage]       = useState(1);
  const [activeCategory, setActiveCategory] = useState<AnimeCategory>('subbed-anime');

  useEffect(() => {
    dispatch({ type: 'FETCH_START' });
    axios
      .get<{ items: AnimeItem[] }>(
        `${BASE_URL}/${activeCategory}?page=${currentPage}&apiKey=${API_KEY}`
      )
      .then((res) => {
        const raw = res.data?.items ?? [];
        dispatch({ type: 'FETCH_SUCCESS', payload: raw });
      })
      .catch(() => dispatch({ type: 'FETCH_ERROR' }));
  }, [currentPage, activeCategory]);

  const handleCategoryChange = (cat: AnimeCategory) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleCardClick = (item: AnimeItem) =>
    router.push(`/Watch/123anime/${encodeURIComponent(item.episodeId)}`);

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-500 mb-4" />
          <p className="text-gray-300 text-sm font-medium tracking-widest uppercase">Loading…</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 bg-[#1a1a2e]">
        <p className="text-gray-400 text-base">No episodes found.</p>
      </div>
    );
  }

  /* ─── Main render ─── */
  return (
    <div className="bg-black py-8 md:py-12">
      <div className="max-w-6xl mx-auto">

        {/* ── Header row ── */}
        <div className="flex items-center justify-between mb-5">
          {/* Title with left accent */}
          <div className="flex items-center gap-3">
            <span className="w-1 h-6 rounded-sm bg-red-800-500 inline-block" />
            <h1 className="text-white text-lg md:text-xl font-bold tracking-wide">
              Latest Release
            </h1>
          </div>

          {/* Right side: category tabs + VIEW ALL */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-[#12122a] rounded border border-[#2a2a4a]">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
                    activeCategory === cat.value
                      ? 'bg-red-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button className="text-xs text-gray-400 hover:text-white border border-[#2a2a4a] rounded px-3 py-1 transition-colors uppercase tracking-wider">
              View All
            </button>
          </div>
        </div>

        {/* ── Mobile category tabs ── */}
        <div className="flex sm:hidden items-center gap-2 mb-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-colors ${
                activeCategory === cat.value
                  ? 'bg-red-500 text-white'
                  : 'bg-[#12122a] text-gray-400 border border-[#2a2a4a] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── Card grid ── */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
          {items.map((item, index) => {
            const statusColor = STATUS_COLORS[item.status] ?? 'bg-blue-600';
            const isDubbed = activeCategory === 'dubbed-anime';
            const isChinese = activeCategory === 'chinese-anime';
            const typeLabel = isChinese ? 'CN' : isDubbed ? 'DUB' : 'SUB';
            const typeBg = isChinese ? 'bg-red-600' : isDubbed ? 'bg-purple-600' : 'bg-red-500';

            return (
              <div
                key={`${item.slug}-${index}`}
                className="cursor-pointer group"
                onClick={() => handleCardClick(item)}
              >
                {/* Image wrapper */}
                <div className="relative aspect-[2/3] rounded overflow-hidden bg-[#12122a]">
                  {item.cover ? (
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-600 text-xs">No Image</span>
                    </div>
                  )}

                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* TV badge — top right */}
                  <span className="absolute top-1.5 right-1.5 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
                    TV
                  </span>

                  {/* Episode badge — bottom left */}
                  <span className="absolute bottom-1.5 left-1.5 bg-[#e8a200] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
                    Ep {item.latestEpisode}
                  </span>

                  {/* Sub/Dub/CN badge — bottom right */}
                  <span className={`absolute bottom-1.5 right-1.5 ${typeBg} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none`}>
                    {typeLabel}
                  </span>

                  {/* Status badge — top left (if not generic) */}
                  {item.status && item.status.toLowerCase() !== 'ongoing' && (
                    <span className={`absolute top-1.5 left-1.5 ${statusColor} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm leading-none uppercase tracking-wide`}>
                      {item.status}
                    </span>
                  )}

                  {/* Play icon on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/60 rounded-full p-2.5">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <p className="mt-1.5 text-gray-200 text-[11px] md:text-xs font-medium leading-tight line-clamp-2 group-hover:text-red-400 transition-colors px-0.5">
                  {item.title}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Pagination ── */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {currentPage > 1 && (
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-1.5 rounded text-xs font-semibold bg-[#12122a] border border-[#2a2a4a] text-gray-300 hover:border-red-500 hover:text-red-400 transition-colors"
            >
              ← Prev
            </button>
          )}

          <span className="px-3 py-1.5 rounded text-xs font-bold bg-[#12122a] border border-[#2a2a4a] text-gray-400">
            Page {currentPage}
          </span>

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-1.5 rounded text-xs font-semibold bg-red-500 hover:bg-red-400 text-white transition-colors"
          >
            Next →
          </button>
        </div>

      </div>
    </div>
  );
}