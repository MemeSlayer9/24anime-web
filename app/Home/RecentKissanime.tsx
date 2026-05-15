'use client';

import React, { useReducer, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

/* ─── Types ─────────────────────────────────────────────── */
interface AnikotoShow {
  id: number;
  title: string;
  alternative: string;
  slug: string;
  rating: string;
  poster: string;
  is_sub: number;
  description: string;
  aired: string;
  season: string;
  year: number;
  duration: string;
  status: string;
  score: string;
  mal_id: string;
  episodes: string;
  ani_id: string;
  source: string;
  background_image: string;
  updated_at: string;
  next_air_schedule_time: number;
  next_air_ep: number;
  terms_by_type: {
    genre?: string[];
    producers?: string[];
    studios?: string[];
    type?: string[];
  };
}

type FetchState = { shows: AnikotoShow[]; loading: boolean };
type FetchAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: AnikotoShow[] }
  | { type: 'FETCH_ERROR' };

function fetchReducer(_state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case 'FETCH_START':   return { shows: [],            loading: true  };
    case 'FETCH_SUCCESS': return { shows: action.payload, loading: false };
    case 'FETCH_ERROR':   return { shows: [],            loading: false };
  }
}

/* ─── Constants ─────────────────────────────────────────── */
const BASE_URL = '/anikoto/recent-anime';
const PER_PAGE = 50;

const STATUS_COLOR: Record<string, string> = {
  'Currently Airing': 'bg-green-500',
  'Finished Airing':  'bg-gray-500',
  'Not yet aired':    'bg-yellow-500',
};

/* ─── Component ─────────────────────────────────────────── */
export default function AnimeEpisodesGrid() {
  const router = useRouter();

  const [{ shows, loading }, dispatch] = useReducer(fetchReducer, {
    shows:   [],
    loading: true,
  });

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch({ type: 'FETCH_START' });
    axios
      .get<{ data: AnikotoShow[] }>(BASE_URL, {
        params: { page: currentPage, per_page: PER_PAGE },
      })
      .then((res) => {
        dispatch({ type: 'FETCH_SUCCESS', payload: res.data?.data ?? [] });
      })
      .catch(() => dispatch({ type: 'FETCH_ERROR' }));
  }, [currentPage]);

  const handleCardClick = (show: AnikotoShow) =>
    router.push(`/Watch/anilist/${show.is_sub}/${show.ani_id}`);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-500 mb-4" />
          <p className="text-gray-300 text-sm font-medium tracking-widest uppercase">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (shows.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 bg-black">
        <p className="text-gray-400 text-base">No episodes found.</p>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <div className="bg-black py-8 md:py-12">
      <div className="max-w-6xl mx-auto">

        {/* Header row */}
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

        {/* Card grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
          {shows.map((show) => {
            const type     = show.terms_by_type?.type?.[0] ?? '';
            const statusBg = STATUS_COLOR[show.status] ?? 'bg-gray-600';

            return (
              <div
                key={show.id}
                className="cursor-pointer group"
                onClick={() => handleCardClick(show)}
              >
                {/* Image wrapper */}
                <div className="relative aspect-[2/3] rounded overflow-hidden bg-[#12122a]">
                  {show.poster ? (
                    <img
                      src={show.poster}
                      alt={show.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-600 text-xs">No Image</span>
                    </div>
                  )}

                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Type badge — top right */}
                  {type && (
                    <span className="absolute top-1.5 right-1.5 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
                      {type}
                    </span>
                  )}

                  {/* Episode badge — bottom left */}
                  <span className="absolute bottom-1.5 left-1.5 bg-[#e8a200] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
                    Ep {show.is_sub}
                  </span>

                  {/* SUB badge — bottom right */}
                  <div className="absolute bottom-1.5 right-1.5 flex flex-col items-end gap-0.5">
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
                      SUB
                    </span>
                  </div>

                  {/* Status badge — top left */}
                  {show.status && (
                    <span className={`absolute top-1.5 left-1.5 ${statusBg} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm leading-none uppercase tracking-wide`}>
                      {show.status === 'Currently Airing' ? 'Airing' : show.status}
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

                {/* Title + year */}
                <p className="mt-1.5 text-gray-200 text-[11px] md:text-xs font-medium leading-tight line-clamp-2 group-hover:text-red-400 transition-colors px-0.5">
                  {show.title}
                </p>
                {show.year && (
                  <p className="text-gray-500 text-[10px] px-0.5">{show.year}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination */}
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