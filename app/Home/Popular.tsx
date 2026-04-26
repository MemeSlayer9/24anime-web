'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AnimeTitle {
  romaji: string;
  english: string | null;
  native: string;
  userPreferred: string;
}

interface Anime {
  id: string;
  malId: number;
  title: AnimeTitle;
  image: string;
  rating?: number;
  releaseDate?: number;
  type?: string;
  genres?: string[];
}

export default function AnimePopularSlider() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('https://partyonyou.vercel.app/meta/anilist/popular')
      .then((response) => {
        setAnimes(response.data.results || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching anime:', err);
        setLoading(false);
      });
  }, []);

  const getDisplayTitle = (title: AnimeTitle): string =>
    title.english || title.romaji || title.userPreferred;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4" />
          <div className="text-white text-xl font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black py-4">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-500 bg-clip-text text-transparent">
          Popular
        </h1>
        <a
          href="/List/Popular"
          className="text-red-500 hover:text-red-400 font-semibold text-sm md:text-base transition-colors flex items-center gap-1 group"
        >
          View More
          <svg
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* Ranked List */}
      <div className="flex flex-col gap-4">
        {animes.map((anime, index) => (
          <div
            key={anime.id}
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => { window.location.href = `/details/${anime.id}`; }}
          >
            {/* Rank Number */}
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-gray-800 text-white text-base font-bold group-hover:bg-red-600 transition-colors">
              {index + 1}
            </div>

            {/* Thumbnail */}
            <div className="flex-shrink-0 w-20 h-30 rounded-md overflow-hidden">
              <img
                src={anime.image || 'https://via.placeholder.com/80x112/1a1a1a/666666?text=N/A'}
                alt={getDisplayTitle(anime.title)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/80x112/1a1a1a/666666?text=N/A';
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white text-sm md:text-base font-semibold leading-snug line-clamp-2 group-hover:text-red-400 transition-colors">
                {getDisplayTitle(anime.title)}
              </h3>

              {anime.genres && anime.genres.length > 0 ? (
                <p className="text-gray-400 text-xs md:text-sm mt-1.5 line-clamp-2">
                  <span className="text-gray-500">Genres: </span>
                  {anime.genres.join(', ')}
                </p>
              ) : anime.type ? (
                <p className="text-gray-400 text-xs md:text-sm mt-1.5">
                  <span className="text-gray-500">Type: </span>
                  {anime.type}
                </p>
              ) : null}

              {anime.rating && (
                <div className="flex items-center gap-1 mt-2">
                  <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-gray-400 text-xs">{anime.rating}/10</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}