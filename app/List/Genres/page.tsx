'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AnimeTitle {
  english?: string;
  romaji?: string;
  native?: string;
}

interface Anime {
  id: string;
  title?: AnimeTitle;
  image?: string;
  rating?: number;
  type?: string;
  releaseDate?: string;
  totalEpisodes?: number;
}

export default function AnilistSearch() {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Action']);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('POPULARITY_DESC');
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
    'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
    'Sports', 'Supernatural', 'Thriller'
  ];

  const sortOptions = [
    { value: 'POPULARITY_DESC', label: 'Most Popular' },
    { value: 'POPULARITY', label: 'Least Popular' },
    { value: 'TRENDING_DESC', label: 'Trending' },
    { value: 'SCORE_DESC', label: 'Highest Rated' },
    { value: 'SCORE', label: 'Lowest Rated' },
    { value: 'FAVOURITES_DESC', label: 'Most Favorites' },
    { value: 'START_DATE_DESC', label: 'Newest' },
    { value: 'START_DATE', label: 'Oldest' },
    { value: 'TITLE_ENGLISH', label: 'Title A-Z' },
    { value: 'TITLE_ENGLISH_DESC', label: 'Title Z-A' },
    { value: 'EPISODES_DESC', label: 'Most Episodes' },
    { value: 'EPISODES', label: 'Least Episodes' }
  ];

  useEffect(() => {
    fetchAnime();
  }, [selectedGenres, page, sortBy]);

  const fetchAnime = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const genresParam = selectedGenres.map(g => `"${g}"`).join(',');
      const response = await fetch(
        `https://juanito66.vercel.app/meta/anilist/advanced-search?genres=[${genresParam}]&page=${page}&sort=["${sortBy}"]`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch anime data');
      }
      
      const data = await response.json();
      setAnimeList(data.results || []);
      setHasNextPage(data.hasNextPage || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAnimeList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreToggle = (genreToToggle: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreToToggle)) {
        return prev.length > 1 ? prev.filter(g => g !== genreToToggle) : prev;
      } else {
        return [...prev, genreToToggle];
      }
    });
    setPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setPage(1);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnimeClick = (animeId: string) => {
    router.push(`/details/${animeId}`);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
       

          {/* Stats Bar */}
     

          {/* Filters Container */}
          <div className="grid lg:grid-cols-2 gap-6 mb-10">
            {/* Genre Filter */}
            <div className="bg-zinc-950/50 backdrop-blur rounded-2xl p-6 border border-red-900/20 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                  <h2 className="text-xl font-bold text-white">Genres</h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedGenres(['Action']);
                    setPage(1);
                  }}
                  className="text-sm text-red-500 hover:text-red-400 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-red-950/30"
                >
                  Reset
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => handleGenreToggle(g)}
                    className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 text-sm ${
                      selectedGenres.includes(g)
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-900/50 scale-105 border border-red-500'
                        : 'bg-zinc-900/80 text-gray-400 hover:bg-zinc-800 hover:text-white border border-zinc-800/50 hover:border-zinc-700'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Filter */}
            <div className="bg-zinc-950/50 backdrop-blur rounded-2xl p-6 border border-red-900/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-white">Sort By</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 text-sm ${
                      sortBy === option.value
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-900/50 border border-red-500'
                        : 'bg-zinc-900/80 text-gray-400 hover:bg-zinc-800 hover:text-white border border-zinc-800/50 hover:border-zinc-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col justify-center items-center py-32">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-red-600/30 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
              </div>
              <p className="text-gray-400 mt-6 font-medium">Loading anime...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-gradient-to-r from-red-950/50 to-red-900/30 border-2 border-red-600/50 rounded-2xl p-8 text-center backdrop-blur">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-red-400 font-semibold text-lg">{error}</p>
              <button 
                onClick={fetchAnime}
                className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Anime Grid */}
          {!loading && !error && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-10">
                {animeList.map((anime) => (
                  <div
                    key={anime.id}
                    onClick={() => handleAnimeClick(anime.id)}
                    className="group bg-zinc-950/80 backdrop-blur rounded-2xl overflow-hidden border border-zinc-900/50 hover:border-red-900/50 shadow-xl hover:shadow-2xl hover:shadow-red-900/20 transform hover:scale-105 transition-all duration-500 cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900">
                      <img
                        src={anime.image || '/placeholder.png'}
                        alt={anime.title?.english || anime.title?.romaji || 'Anime'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {anime.rating && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1.5 rounded-xl font-bold text-sm shadow-2xl backdrop-blur flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                          {(anime.rating / 10).toFixed(1)}
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur text-white px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider">
                        {anime.type || 'TV'}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-bold text-sm line-clamp-2 mb-2 group-hover:text-red-500 transition-colors">
                        {anime.title?.english || anime.title?.romaji || 'Unknown Title'}
                      </h3>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium">{anime.releaseDate || 'N/A'}</span>
                        {anime.totalEpisodes && (
                          <span className="text-red-500 font-semibold">{anime.totalEpisodes} EP</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {animeList.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6 py-8">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold disabled:opacity-20 disabled:cursor-not-allowed hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-900/50 hover:shadow-red-900/70 hover:scale-105 disabled:hover:scale-100"
                  >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="m15 18-6-6 6-6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-zinc-950/50 backdrop-blur border border-red-900/20 rounded-xl px-6 py-3">
                      <span className="text-gray-400 text-sm font-medium">Page</span>
                      <span className="text-white font-bold text-xl ml-2">{page}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={!hasNextPage}
                    className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold disabled:opacity-20 disabled:cursor-not-allowed hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-900/50 hover:shadow-red-900/70 hover:scale-105 disabled:hover:scale-100"
                  >
                    Next
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="m9 18 6-6-6-6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}

          {/* No Results */}
          {!loading && !error && animeList.length === 0 && (
            <div className="text-center py-32">
              <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-gray-400 text-xl font-medium">No anime found</p>
              <p className="text-gray-600 text-sm mt-2">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}