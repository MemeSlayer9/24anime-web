'use client';

import React, { useReducer, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface AnimeItem {
  episodeId: string;
  animeTitle: string;
  episode: number;
  thumbnail: string;
  date: string;
  watchUrl: string;
  animeUrl: string;
  animeSlug: string;
  streamUrl: string;
}

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

const API_URL = 'https://sad-ebon-nine.vercel.app/anime/animedao/recent?apiKey=fuckyoubitch';
const ITEMS_PER_PAGE = 30;

export default function AnimeEpisodesGrid() {
  const router = useRouter();

  const [{ items, loading }, dispatch] = useReducer(fetchReducer, {
    items: [],
    loading: true,
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all items once on mount
  useEffect(() => {
    dispatch({ type: 'FETCH_START' });
    axios
      .get<{ recent: AnimeItem[] }>(API_URL)
      .then((res) => {
        const raw = res.data?.recent ?? [];
        dispatch({ type: 'FETCH_SUCCESS', payload: raw });
      })
      .catch(() => dispatch({ type: 'FETCH_ERROR' }));
  }, []);

  // Client-side pagination
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCardClick = (item: AnimeItem) =>
    router.push(`/Watch/animedao/${encodeURIComponent(item.episodeId)}`);

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
          <div className="flex items-center gap-3">
            <span className="w-1 h-6 rounded-sm bg-red-500 inline-block" />
            <h1 className="text-white text-lg md:text-xl font-bold tracking-wide">
              Latest Release
            </h1>
          </div>

          <button className="text-xs text-gray-400 hover:text-white border border-[#2a2a4a] rounded px-3 py-1 transition-colors uppercase tracking-wider">
            View All
          </button>
        </div>

        {/* ── Card grid ── */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
          {paginatedItems.map((item, index) => (
            <div
              key={`${item.episodeId}-${index}`}
              className="cursor-pointer group"
              onClick={() => handleCardClick(item)}
            >
              {/* Image wrapper */}
              <div className="relative aspect-[2/3] rounded overflow-hidden bg-[#12122a]">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.animeTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-600 text-xs">No Image</span>
                  </div>
                )}

                {/* Dark overlay on hover */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Episode badge — bottom left */}
                <span className="absolute bottom-1.5 left-1.5 bg-[#e8a200] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
                  Ep {item.episode}
                </span>

                {/* SUB badge — bottom right */}
                <span className="absolute bottom-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
                  SUB
                </span>

                {/* Date badge — top right */}
                <span className="absolute top-1.5 right-1.5 bg-black/60 text-gray-300 text-[9px] font-semibold px-1.5 py-0.5 rounded-sm leading-none">
                  {item.date}
                </span>

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
                {item.animeTitle}
              </p>
            </div>
          ))}
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
            Page {currentPage} / {totalPages}
          </span>

          {currentPage < totalPages && (
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-1.5 rounded text-xs font-semibold bg-red-500 hover:bg-red-400 text-white transition-colors"
            >
              Next →
            </button>
          )}
        </div>

      </div>
    </div>
  );
}