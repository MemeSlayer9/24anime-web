'use client';

import React, { useReducer, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface AnimeShow {
  slug: string;
  title: string;
  year: number;
  type: string;
  status: string | null;
  latestEp: number;
  latestEpSlug: string;
  languages: string[];
  language: string;
  poster: string;
}

type LangFilter = 'all' | 'sub' | 'dub' | 'chinese';

type FetchState = { shows: AnimeShow[]; loading: boolean };
type FetchAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: AnimeShow[] }
  | { type: 'FETCH_ERROR' };

function fetchReducer(_state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case 'FETCH_START':   return { shows: [], loading: true };
    case 'FETCH_SUCCESS': return { shows: action.payload, loading: false };
    case 'FETCH_ERROR':   return { shows: [], loading: false };
  }
}

const API_KEY  = 'fuckyoubitch';
const BASE_URL = 'https://sad-ebon-nine.vercel.app/anime/kissanime/browse';

const LANG_TABS: { label: string; value: LangFilter }[] = [
  { label: 'ALL',     value: 'all'     },
  { label: 'SUB',     value: 'sub'     },
  { label: 'DUB',     value: 'dub'     },
  { label: 'CHINESE', value: 'chinese' },
];

const LANG_BADGE_BG: Record<string, string> = {
  SUB:     'bg-red-500',
  DUB:     'bg-purple-600',
  CHINESE: 'bg-orange-500',
};
export default function AnimeEpisodesGrid() {
  const router = useRouter();

  const [{ shows, loading }, dispatch] = useReducer(fetchReducer, {
    shows: [],
    loading: true,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [activeLang, setActiveLang]   = useState<LangFilter>('sub');

  useEffect(() => {
    dispatch({ type: 'FETCH_START' });
    axios
      .get<{ shows: AnimeShow[] }>(BASE_URL, {
        params: { lang: activeLang, page: currentPage, apiKey: API_KEY },
      })
      .then((res) => {
        dispatch({ type: 'FETCH_SUCCESS', payload: res.data?.shows ?? [] });
      })
      .catch(() => dispatch({ type: 'FETCH_ERROR' }));
  }, [currentPage, activeLang]);

  const handleLangChange = (lang: LangFilter) => {
    setActiveLang(lang);
    setCurrentPage(1);
  };

  const handleCardClick = (show: AnimeShow) =>
    router.push(`/Watch/kissanime/${encodeURIComponent(show.slug)}`);

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

  if (shows.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 bg-black">
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

          {/* Desktop lang tabs + View All */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-[#12122a] rounded border border-[#2a2a4a]">
              {LANG_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleLangChange(tab.value)}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
                    activeLang === tab.value
                      ? 'bg-red-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button className="text-xs text-gray-400 hover:text-white border border-[#2a2a4a] rounded px-3 py-1 transition-colors uppercase tracking-wider">
              View All
            </button>
          </div>
        </div>

        {/* ── Mobile lang tabs ── */}
        <div className="flex sm:hidden items-center gap-2 mb-5">
          {LANG_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleLangChange(tab.value)}
              className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-colors ${
                activeLang === tab.value
                  ? 'bg-red-500 text-white'
                  : 'bg-[#12122a] text-gray-400 border border-[#2a2a4a] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Card grid ── */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
          {shows.map((show, index) => (
            <div
              key={`${show.slug}-${index}`}
              className="cursor-pointer group"
              onClick={() => handleCardClick(show)}
            >
              {/* Image wrapper */}
              <div className="relative aspect-[2/3] rounded overflow-hidden bg-[#12122a]">
                {show.poster ? (
               <img
  src={show.poster?.replace(/\.jpe?g$/i, '.webp')}
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

                {/* Type badge — top right (TV, Movie, OVA…) */}
                {show.type && (
                  <span className="absolute top-1.5 right-1.5 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
                    {show.type}
                  </span>
                )}

                {/* Episode badge — bottom left */}
                <span className="absolute bottom-1.5 left-1.5 bg-[#e8a200] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
                  Ep {show.latestEp}
                </span>

                {/* Language badges — bottom right (SUB / DUB pills) */}
                <div className="absolute bottom-1.5 right-1.5 flex flex-col items-end gap-0.5">
                  {show.languages.map((lang) => (
                    <span
                      key={lang}
                      className={`${LANG_BADGE_BG[lang] ?? 'bg-gray-600'} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm leading-none`}
                    >
                      {lang}
                    </span>
                  ))}
                </div>

                {/* Status badge — top left (only if present) */}
                {show.status && (
                  <span className="absolute top-1.5 left-1.5 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm leading-none uppercase tracking-wide">
                    {show.status}
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