'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Episode {
  id: string;
  title: string;
  url: string;
  image: string;
  duration: string;
  japaneseTitle: string;
  type: string;
  sub: number;
  dub: number;
  episodes: number;
  animeDetails?: {
    latestEpisode?: {
      episodeId: string;
      episodeNumber: number;
    };
    anilistId?: number;
  };
}

export default function AnimeEpisodesSlider() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
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
    axios.get('https://kangaroo-kappa.vercel.app/anime/zoro/recent-episodes')
      .then(async (response) => {
        const results = response.data.results || [];
        
        // Fetch anime details for each episode to get latest episode and anilistId
        const episodesWithDetails = await Promise.all(
          results.map(async (episode: Episode) => {
            try {
              const detailsResponse = await axios.get(
                `https://kenjitsu.vercel.app/api/hianime/anime/${episode.id}`
              );
              
              const data = detailsResponse.data.data;
              const providerEpisodes = detailsResponse.data.providerEpisodes || [];
              
              // Get the latest episode (last in the array)
              const latestEpisode = providerEpisodes.length > 0 
                ? providerEpisodes[providerEpisodes.length - 1]
                : null;
              
              return {
                ...episode,
                animeDetails: {
                  latestEpisode: latestEpisode ? {
                    episodeId: latestEpisode.episodeId,
                    episodeNumber: latestEpisode.episodeNumber
                  } : undefined,
                  anilistId: data.anilistId
                }
              };
            } catch (err) {
              console.error(`Error fetching details for ${episode.id}:`, err);
              return episode;
            }
          })
        );
        
        setEpisodes(episodesWithDetails);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching episodes:', err);
        setLoading(false);
      });
  }, []);

  const maxIndex = Math.max(0, episodes.length - visibleItems);
  const boundedIndex = Math.min(currentIndex, maxIndex);

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
          <div className="text-white text-xl font-semibold">Loading Episodes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black py-8 md:py-12">
      <div className="max-w-9x3 mx-auto">
        {/* Header with gradient text */}
     {/* Header with gradient text */}
    {/* Header with gradient text */}
        <div className="mb-6 md:mb-8 px-4 md:px-8 lg:px-12 flex items-center justify-between gap-3">
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-500 bg-clip-text text-transparent leading-tight">
            Recent Episodes
          </h1>
          <a 
            href="/List/Recent-episodes" 
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
          {/* Previous Button */}
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

          {/* Slider Container */}
          <div className="overflow-hidden rounded-xl">
            <div
              className="flex transition-transform duration-700 ease-out gap-4 md:gap-6"
              style={{
                transform: `translateX(-${boundedIndex * (100 / visibleItems)}%)`
              }}
            >
              {episodes.map((episode) => (
                <div
                  key={episode.id}
                  className="flex-shrink-0"
                  style={{ width: `calc(${100 / visibleItems}% - ${(visibleItems - 1) * 24 / visibleItems}px)` }}
                  onClick={() => {
                    // Use latest episode if available, otherwise fallback to url
                    if (episode.animeDetails?.latestEpisode?.episodeId && episode.animeDetails?.anilistId) {
                      window.location.href = `/Watch/hianime/${episode.animeDetails.latestEpisode.episodeId}?animeId=${episode.animeDetails.anilistId}`;
                    } else {
                      window.location.href = episode.url;
                    }
                  }}
                >
                  <div className="bg-gradient-to-b from-black-900 to-black rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 cursor-pointer group border border-gray-800 hover:border-red-600/50">
                    <div className="relative aspect-[5/5] overflow-hidden bg-black-900">
                      <img
                        src={episode.image}
                        alt={episode.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Episode/Sub badge */}
                      <div className="absolute bottom-3 right-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg">
                        {episode.animeDetails?.latestEpisode?.episodeNumber 
                          ? `EP ${episode.animeDetails.latestEpisode.episodeNumber}` 
                          : episode.sub > 0 ? `SUB ${episode.sub}` : episode.type}
                      </div>

                      {/* Duration badge */}
                      {episode.duration && (
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-semibold">
                          {episode.duration}
                        </div>
                      )}

                      {/* Play icon on hover */}
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
                        {episode.title}
                      </h3>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        {episode.japaneseTitle && (
                          <p className="text-gray-400 line-clamp-1 flex-1">
                            {episode.japaneseTitle}
                          </p>
                        )}
                        {episode.animeDetails?.anilistId && (
                          <span className="text-red-500 font-semibold ml-2 flex-shrink-0">
                            AL: {episode.animeDetails.anilistId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
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

        {/* Enhanced Pagination Indicator */}
         
      </div>
    </div>
  );
}