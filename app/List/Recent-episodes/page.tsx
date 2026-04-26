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

export default function AnimeEpisodesGrid() {
  const router = useRouter();

  const [{ items, loading }, dispatch] = useReducer(fetchReducer, {
    items: [],
    loading: true,
  });

  const [currentPage, setCurrentPage]       = useState(1);
  const [pageInput, setPageInput]           = useState('1');
  const [activeCategory, setActiveCategory] = useState<AnimeCategory>('subbed-anime');

  const pageNavTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dispatch({ type: 'FETCH_START' });

    axios
      .get<{ items: AnimeItem[] }>(
        `${BASE_URL}/${activeCategory}?page=${currentPage}&apiKey=${API_KEY}`
      )
      .then((response) => {
        const raw = response.data?.items ?? [];
        if (raw.length === 0) console.warn('No data returned:', response.data);
        dispatch({ type: 'FETCH_SUCCESS', payload: raw });
      })
      .catch((err) => {
        console.error('Error fetching anime list:', err);
        dispatch({ type: 'FETCH_ERROR' });
      });
  }, [currentPage, activeCategory]);

  /* ─── Category switch ─── */
  const handleCategoryChange = (category: AnimeCategory) => {
    setActiveCategory(category);
    setCurrentPage(1);
    setPageInput('1');
  };

  /* ─── Pagination helpers ─── */
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const p = currentPage - 1;
      setCurrentPage(p);
      setPageInput(String(p));
    }
  };

  const handleNextPage = () => {
    const p = currentPage + 1;
    setCurrentPage(p);
    setPageInput(String(p));
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPageInput(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      if (pageNavTimer.current) clearTimeout(pageNavTimer.current);
      pageNavTimer.current = setTimeout(() => setCurrentPage(parsed), 800);
    }
  };

  const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (pageNavTimer.current) clearTimeout(pageNavTimer.current);
      const parsed = parseInt(pageInput, 10);
      if (!isNaN(parsed) && parsed >= 1) setCurrentPage(parsed);
      else setPageInput(String(currentPage));
    }
  };

  const handlePageInputBlur = () => {
    if (pageNavTimer.current) clearTimeout(pageNavTimer.current);
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1) setCurrentPage(parsed);
    else setPageInput(String(currentPage));
  };

  /* ─── Navigation ─── */
  const handleCardClick = (item: AnimeItem) => {
    router.push(`/Watch/123anime/${encodeURIComponent(item.episodeId)}`);
  };

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4" />
          <div className="text-white text-xl font-semibold">Loading Episodes...</div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 bg-black">
        <div className="text-white text-xl font-semibold">No episodes found.</div>
      </div>
    );
  }

  /* ─── Main render ─── */
  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header + Tabs */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-500 bg-clip-text text-transparent leading-tight">
            Recent Episodes
          </h1>

          <div className="flex items-center bg-gray-900 rounded-full p-1 border border-gray-800">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
                  activeCategory === cat.value
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {items.map((item, index) => (
            <div
              key={`${item.slug}-${index}`}
              className="bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 cursor-pointer group border border-gray-800 hover:border-red-600/50"
              onClick={() => handleCardClick(item)}
            >
              <div className="relative aspect-[3/3] overflow-hidden">
                {item.cover ? (
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No Image</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute bottom-3 right-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg">
                  EP {item.latestEpisode}
                </div>

                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-red-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                  {item.status}
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-red-600/20 backdrop-blur-sm rounded-full p-4 md:p-5">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="p-3 md:p-4">
                <h3 className="text-white text-sm md:text-base font-semibold line-clamp-2 min-h-[2.5rem] md:min-h-[3rem] group-hover:text-red-400 transition-colors">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:from-gray-800 disabled:to-gray-800 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-red-500/50 hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="flex items-center bg-gray-900 px-4 py-2 rounded-full border border-gray-800">
            <span className="text-white font-semibold text-lg mr-2">Page</span>
            <input
              type="text"
              value={pageInput}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputSubmit}
              onBlur={handlePageInputBlur}
              className="bg-gray-800 text-white font-semibold text-lg text-center rounded-lg px-3 py-1 w-16 border border-gray-700 focus:border-red-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            onClick={handleNextPage}
            className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-red-500/50 hover:scale-105 flex items-center gap-2"
          >
            Next
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}