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
}

export default function AnimePopularSlider() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(5);

  useEffect(() => {
    const updateVisibleItems = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(2);
      } else if (window.innerWidth < 768) {
        setVisibleItems(3);
      } else if (window.innerWidth < 1024) {
        setVisibleItems(4);
      } else {
        setVisibleItems(5);
      }
    };

    updateVisibleItems();
    window.addEventListener('resize', updateVisibleItems);
    return () => window.removeEventListener('resize', updateVisibleItems);
  }, []);

  useEffect(() => {
    axios.get('https://partyonyou.vercel.app/meta/anilist/popular')
      .then(response => {
        setAnimes(response.data.results || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching anime:', err);
        setLoading(false);
      });
  }, []);

  const maxIndex = Math.max(0, animes.length - visibleItems);
  const boundedIndex = Math.min(currentIndex, maxIndex);

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const getDisplayTitle = (title: AnimeTitle): string => {
    return title.english || title.romaji || title.userPreferred;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
          <div className="text-white text-xl font-semibold">Loading Popular Anime...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black py-8 md:py-12">
      <div className="max-w-9x3 mx-auto">
      {/* Header with gradient text */}
       {/* Header with gradient text */}
        <div className="mb-6 md:mb-8 px-4 md:px-8 lg:px-12 flex items-center justify-between gap-3">
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-500 bg-clip-text text-transparent leading-tight">
            Popular
          </h1>
          <a 
            href="/List/Popular" 
            className="text-red-500 hover:text-red-400 font-semibold text-base sm:text-lg md:text-xl lg:text-2xl transition-colors flex items-center gap-1 group flex-shrink-0"
          >
            <span className="hidden sm:inline">View More</span>
            <span className="sm:hidden">More</span>
            <svg 
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        
        <div className="relative px-8 md:px-12">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:from-gray-800 disabled:to-gray-800 rounded-full p-3 md:p-4 transition-all shadow-lg hover:shadow-red-500/50 hover:scale-110"
            aria-label="Previous"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="overflow-hidden rounded-xl">
            <div
              className="flex transition-transform duration-700 ease-out gap-4 md:gap-6"
              style={{
                transform: `translateX(-${boundedIndex * (100 / visibleItems)}%)`
              }}
            >
              {animes.map((anime) => (
                <div
                  key={anime.id}
                  className="flex-shrink-0"
                  style={{ width: `calc(${100 / visibleItems}% - ${(visibleItems - 1) * 24 / visibleItems}px)` }}
                  onClick={() => {
                    window.location.href = `/details/${anime.id}`;
                  }}
                >
                  <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 cursor-pointer group border border-gray-800 hover:border-red-600/50">
                    <div className="relative aspect-[5/5] overflow-hidden">
                      <img
                        src={anime.image || 'https://via.placeholder.com/300x400/1a1a1a/666666?text=No+Image'}
                        alt={getDisplayTitle(anime.title)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/300x400/1a1a1a/666666?text=No+Image';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {anime.type && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg">
                          {anime.type}
                        </div>
                      )}

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
                        {getDisplayTitle(anime.title)}
                      </h3>
                      {anime.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-gray-400 text-xs">{anime.rating}/10</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={boundedIndex >= maxIndex}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 disabled:opacity-30 disabled:cursor-not-allowed disabled:from-gray-800 disabled:to-gray-800 rounded-full p-3 md:p-4 transition-all shadow-lg hover:shadow-red-500/50 hover:scale-110"
            aria-label="Next"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-8 md:mt-10">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                boundedIndex === index 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 w-8 md:w-10 shadow-lg shadow-red-500/50' 
                  : 'bg-gray-800 w-2 hover:bg-gray-700'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}