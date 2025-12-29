'use client';

import React, { useState, useEffect } from 'react';

interface Episode {
  episodeId: string;
  episodeNumber: number;
  title: string;
  thumbnail: string;
}

const getWeservImage = (imageUrl: string, width?: number): string => {
  if (!imageUrl) return '';
  try {
    const encodedUrl = encodeURIComponent(imageUrl);
    let weservUrl = `https://animepahe-pi.vercel.app/api/proxy/image?url=${encodedUrl}`;
    if (width) {
      weservUrl += `&w=${width}&fit=cover`;
    }
    return weservUrl;
  } catch {
    return imageUrl;
  }
};

export default function AnimeEpisodesGrid() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');

  useEffect(() => {
    const fetchEpisodes = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://kenjitsu.vercel.app/api/animepahe/episodes/recent?page=${currentPage}`);
        const data = await res.json();
        setEpisodes(data.data || []);
      } catch (err) {
        console.error('Error fetching episodes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setPageInput(newPage.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    const newPage = currentPage + 1;
    setCurrentPage(newPage);
    setPageInput(newPage.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPageInput(value);
    
    // Automatically navigate when a valid number is typed
    const pageNumber = parseInt(value);
    if (!isNaN(pageNumber) && pageNumber > 0) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const handlePageInputBlur = () => {
    // Reset to current page if input is empty or invalid
    if (!pageInput || isNaN(parseInt(pageInput)) || parseInt(pageInput) <= 0) {
      setPageInput(currentPage.toString());
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
          <div className="text-white text-xl font-semibold">Loading Episodes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-500 bg-clip-text text-transparent">
            Recent Episodes
          </h1>
         
        </div>
        
        {/* Flexbox Grid - 4 items per line */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {episodes.map((episode) => (
            <div
              key={episode.episodeId}
              onClick={() => {
                const animeId = episode.episodeId.split('-$session$-')[0].replace('pahe-', '');
                window.location.href = `/Watch/animepahe2/${episode.episodeId}?animeId=${animeId}`;
              }}
            >
              <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 cursor-pointer group border border-gray-800 hover:border-red-600/50">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={getWeservImage(episode.thumbnail, 400)}
                    alt={episode.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Episode badge */}
                  <div className="absolute bottom-3 right-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg">
                    EP {episode.episodeNumber}
                  </div>

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
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
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