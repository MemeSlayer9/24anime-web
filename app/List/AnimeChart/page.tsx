'use client';

import axios from "axios";
import React, { useEffect, useState } from "react";
import Link from "next/link";

// Constants
const FORMATS = ["TV", "TV_SHORT", "OVA", "ONA", "MOVIE", "SPECIAL"];
const SEASONS = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
const START_YEAR = 1999;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, i) => 
  (START_YEAR + i).toString()
);
const PER_PAGE = 100;
const API_BASE_URL = "https://juanito66.vercel.app/meta/anilist/advanced-search";

interface AnimeTitle {
  userPreferred: string;
  romaji: string;
}

interface AnimeItem {
  id: string;
  title: AnimeTitle;
  genres: string[];
  currentEpisode?: number;
  status: string;
  image: string;
  rating: number;
  type: string;
  totalEpisodes: number;
  description: string;
}

interface AnimeData {
  results: AnimeItem[];
}

interface State {
  anime: AnimeData | null;
  otherAnime: AnimeData | null;
  loading: boolean;
  showOtherAnime: boolean;
  page: number;
  format: string;
  year: string;
  season: string;
  sortBy: string;
}

const getCurrentSeason = () => {
  const currentMonth = new Date().getMonth() + 1;
  
  if (currentMonth === 1) return 'WINTER';
  if (currentMonth === 4) return 'SPRING';
  if (currentMonth === 7) return 'SUMMER';
  if (currentMonth === 10) return 'FALL';
  
  if (currentMonth >= 2 && currentMonth <= 3) return 'WINTER';
  if (currentMonth >= 5 && currentMonth <= 6) return 'SPRING';
  if (currentMonth >= 8 && currentMonth <= 9) return 'SUMMER';
  if (currentMonth >= 11 || currentMonth === 12) return 'FALL';
  
  return 'FALL';
};

const SearchResultsSkeleton = ({ name }: { name: string }) => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="text-center">
      <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent mb-4"></div>
      <p className="text-white text-xl font-medium">Loading {name}...</p>
    </div>
  </div>
);

function TrendingAnime() {
  const [state, setState] = useState<State>({
    anime: null,
    otherAnime: null,
    loading: true,
    showOtherAnime: false,
    page: 1,
    format: 'TV',
    year: '2025',
    season: getCurrentSeason(),
    sortBy: 'default'
  });

  const handlePageChange = (newPage: number) => {
    setState(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (state.page > 1) {
      handlePageChange(state.page - 1);
    }
  };

  const handleNextPage = () => {
    handlePageChange(state.page + 1);
  };

  const handleFilterChange = (field: string, value: string) => {
    setState(prev => ({
      ...prev,
      [field]: value,
      showOtherAnime: false,
      page: 1
    }));
  };

  const handleTBAToggle = () => {
    setState(prev => ({ ...prev, showOtherAnime: !prev.showOtherAnime }));
  };

  const sortAnimeData = (data: AnimeData | null): AnimeData | null => {
    if (!data || !data.results) return data;

    const sortedResults = [...data.results];

    switch (state.sortBy) {
      case 'rating-high':
        sortedResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'rating-low':
        sortedResults.sort((a, b) => (a.rating || 0) - (b.rating || 0));
        break;
      default:
        // Keep original order
        break;
    }

    return { ...data, results: sortedResults };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        const seasonalParams = new URLSearchParams({
          season: state.season,
          year: state.year,
          page: state.page.toString(),
          perPage: PER_PAGE.toString(),
          format: state.format
        });

        const tbaParams = new URLSearchParams({
          status: 'NOT_YET_RELEASED',
          page: state.page.toString(),
          format: state.format
        });

        const [animeResponse, otherResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}?${seasonalParams.toString()}`),
          axios.get(`${API_BASE_URL}?${tbaParams.toString()}`)
        ]);

        setState(prev => ({
          ...prev,
          anime: animeResponse.data,
          otherAnime: otherResponse.data,
          loading: false
        }));
      } catch (err) {
        console.error('Error fetching anime data:', err);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, [state.page, state.format, state.year, state.season]);

  const renderAnimeCard = (item: AnimeItem) => (
    <Link 
      href={`/details/${item.id}`} 
      key={item.id}
      className="group relative bg-gradient-to-b from-black to-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-red-600 transition-all duration-300 hover:shadow-2xl hover:shadow-red-600/30 hover:-translate-y-2"
    >
      {/* Image Container */}
      <div className="relative h-80 overflow-hidden">
        <img 
          src={item.image} 
          alt={item.title.romaji}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80"></div>
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg">
          {item.currentEpisode ? `EP ${item.currentEpisode}` : item.status}
        </div>
        
        {/* Rating Badge */}
        {item.rating && (
          <div className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {item.rating}%
          </div>
        )}
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
            {item.title.userPreferred}
          </h3>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {item.genres.slice(0, 3).map((genre, idx) => (
              <span 
                key={idx}
                className="text-xs bg-black/80 backdrop-blur-sm text-gray-300 px-2 py-1 rounded-md"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Info Section */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-black/50 rounded-lg p-2 text-center border border-gray-800">
            <p className="text-gray-400 text-xs mb-1">Type</p>
            <p className="text-white font-semibold">{item.type}</p>
          </div>
          <div className="bg-black/50 rounded-lg p-2 text-center border border-gray-800">
            <p className="text-gray-400 text-xs mb-1">Episodes</p>
            <p className="text-white font-semibold">{item.totalEpisodes || 'N/A'}</p>
          </div>
        </div>
        
        {/* Description Preview */}
        <div className="text-gray-400 text-sm line-clamp-3 leading-relaxed" 
             dangerouslySetInnerHTML={{ __html: item.description || 'No description available.' }} 
        />
      </div>
    </Link>
  );

  const renderFilterControls = () => (
    <div className="flex flex-wrap items-center gap-3 mb-8">
      <button
        onClick={handleTBAToggle}
        className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
          state.showOtherAnime 
            ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
            : 'bg-black text-gray-300 hover:bg-gray-900 border border-gray-800'
        }`}
      >
        {state.showOtherAnime ? '📅 Show Seasonal' : '🔮 TBA Anime'}
      </button>

      <select
        value={state.season}
        onChange={(e) => handleFilterChange('season', e.target.value)}
        className="px-4 py-2.5 bg-black text-white rounded-lg font-medium text-sm border border-gray-800 hover:border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all cursor-pointer"
      >
        {SEASONS.map((season) => (
          <option key={season} value={season}>{season}</option>
        ))}
      </select>

      <select
        value={state.format}
        onChange={(e) => handleFilterChange('format', e.target.value)}
        className="px-4 py-2.5 bg-black text-white rounded-lg font-medium text-sm border border-gray-800 hover:border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all cursor-pointer"
      >
        {FORMATS.map((format) => (
          <option key={format} value={format}>{format}</option>
        ))}
      </select>

      <select
        value={state.year}
        onChange={(e) => handleFilterChange('year', e.target.value)}
        className="px-4 py-2.5 bg-black text-white rounded-lg font-medium text-sm border border-gray-800 hover:border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all cursor-pointer"
      >
        {YEARS.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>

      <select
        value={state.sortBy}
        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        className="px-4 py-2.5 bg-black text-white rounded-lg font-medium text-sm border border-gray-800 hover:border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all cursor-pointer"
      >
        <option value="default">⭐ Default Order</option>
        <option value="rating-high">⬆️ Rating: High to Low</option>
        <option value="rating-low">⬇️ Rating: Low to High</option>
      </select>
    </div>
  );

  const renderPagination = () => (
    <div className="flex items-center justify-center gap-4 mt-12 mb-8">
      <button
        onClick={handlePrevPage}
        disabled={state.page === 1}
        className="px-6 py-3 bg-black text-white rounded-lg font-semibold border border-gray-800 hover:border-red-600 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-800 disabled:hover:bg-black transition-all"
      >
        ← Previous
      </button>
      
      <div className="flex items-center gap-3">
        <span className="text-white font-medium">Page</span>
        <select
          value={state.page}
          onChange={(e) => handlePageChange(parseInt(e.target.value))}
          className="px-4 py-3 bg-black text-white rounded-lg font-medium border border-gray-800 hover:border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all cursor-pointer"
        >
          {Array.from({ length: 100 }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
        <span className="text-gray-400">of 100</span>
      </div>
      
      <button
        onClick={handleNextPage}
        className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all"
      >
        Next →
      </button>
    </div>
  );

  const currentAnimeData = sortAnimeData(state.showOtherAnime ? state.otherAnime : state.anime);
  const selectedSeason = state.showOtherAnime ? 'TBA' : state.season;

  return (
    <div className="min-h-screen bg-black">
      {state.loading && <SearchResultsSkeleton name="Trending Anime" />}
      
      {!state.loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                Anime Chart
              </span>
            </h1>
            <p className="text-gray-400 text-lg mb-6">
              Discover {selectedSeason} {state.year} anime • {currentAnimeData?.results?.length || 0} results
            </p>
            {renderFilterControls()}
          </div>

          {/* Anime Grid */}
                  {currentAnimeData?.results && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mb-8">
              {currentAnimeData.results.map(renderAnimeCard)}
            </div>
          )}

          {renderPagination()}
        </div>
      )}
    </div>
  );
}

export default TrendingAnime;