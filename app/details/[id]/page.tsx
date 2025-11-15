"use client";

import React, { useState, useEffect } from "react";

interface AnimeDetails {
  id: string;
  malId?: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
    userPreferred?: string;
  };
  image: string;
  cover: string;
  description: string;
  status: string;
  releaseDate: number;
  rating?: number;
  genres?: string[];
  totalEpisodes: number | null;
  duration?: number;
  type: string;
  studios?: string[];
  season?: string;
  popularity?: number;
  episodes?: Episode[];
}

interface Episode {
  episodeNumber: number;
  episodeId: string;
  title: string;
  rating?: string;
  aired?: boolean;
  airDate?: string;
  overview?: string;
  thumbnail?: string;
  provider?: string;
}

// Custom Icon Components
const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const TvIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
    <polyline points="17 2 12 7 7 2"/>
  </svg>
);

function AnimeDetailsPage() {
  const [animeId, setAnimeId] = useState<string>("");
  const [animeData, setAnimeData] = useState<AnimeDetails | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [episodesError, setEpisodesError] = useState<string | null>(null);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("hianime");

  const providers = ["hianime", "allanime", "animepahe", "anizone"];

  // Extract ID from URL on mount
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const pathParts = window.location.pathname.split('/');
    const id = hash || pathParts[pathParts.length - 1] || "";
    
    if (id && id !== 'details') {
      setAnimeId(id);
    }
  }, []);

  // Fetch anime details when ID is set
  useEffect(() => {
    async function fetchAnimeDetails() {
      if (!animeId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`https://makgago.vercel.app/meta/anilist/info/${animeId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setAnimeData(data);
      } catch (err) {
        console.error("Error fetching anime details:", err);
        setError(err instanceof Error ? err.message : "Failed to load anime details");
      } finally {
        setLoading(false);
      }
    }

    fetchAnimeDetails();
  }, [animeId]);

  // Fetch episodes from new API
  useEffect(() => {
    async function fetchEpisodes() {
      if (!animeId) return;
      
      try {
        setEpisodesLoading(true);
        setEpisodesError(null);
        const response = await fetch(`https://kenjitsu.vercel.app/api/anilist/episodes/${animeId}?provider=${selectedProvider}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // The API returns episodes in the providerEpisodes array
        if (data.providerEpisodes && Array.isArray(data.providerEpisodes)) {
          setEpisodes(data.providerEpisodes);
        } else {
          setEpisodes([]);
        }
      } catch (err) {
        console.error("Error fetching episodes:", err);
        setEpisodesError(err instanceof Error ? err.message : "Failed to load episodes");
      } finally {
        setEpisodesLoading(false);
      }
    }

    fetchEpisodes();
  }, [animeId, selectedProvider]);

  if (!animeId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-4">No Anime ID Found</h2>
          <p className="text-gray-400 mb-6">Please select an anime from the carousel</p>
          <button
            onClick={() => window.history.back()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading anime details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-red-500 mb-4">Error Loading Anime</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!animeData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">No data available</div>
      </div>
    );
  }

  const title = animeData.title.english || animeData.title.romaji || animeData.title.userPreferred || "Unknown Title";
  const displayedEpisodes = showAllEpisodes ? episodes : episodes.slice(0, 12);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Cover */}
      <div className="relative w-full h-[500px]">
        <img
          src={animeData.cover || animeData.image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="absolute top-6 left-6 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold transition-all z-10"
        >
          ← Back
        </button>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 -mt-64 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img
              src={animeData.image}
              alt={title}
              className="w-64 h-96 object-cover rounded-lg shadow-2xl"
            />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-6">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              {title}
            </h1>

            {/* Anime ID Display */}
            <div className="bg-black/50 backdrop-blur-sm border border-red-900/50 rounded-lg p-4">
              <p className="text-red-400 text-sm mb-1">Anime ID</p>
              <p className="text-white font-mono text-lg">{animeId}</p>
              {animeData.malId && (
                <>
                  <p className="text-red-400 text-sm mt-3 mb-1">MyAnimeList ID</p>
                  <p className="text-white font-mono text-lg">{animeData.malId}</p>
                </>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3">
              {animeData.rating && (
                <div className="flex items-center gap-2 bg-yellow-500/90 text-black px-4 py-2 rounded-full font-semibold">
                  <StarIcon />
                  <span>{(animeData.rating / 10).toFixed(1)}</span>
                </div>
              )}
              <span className="bg-black/40 backdrop-blur-sm text-white border border-red-900/30 px-4 py-2 rounded-full font-medium">
                {animeData.type}
              </span>
              <span className="bg-black/40 backdrop-blur-sm text-white border border-red-900/30 px-4 py-2 rounded-full font-medium flex items-center gap-2">
                <CalendarIcon />
                {animeData.releaseDate}
              </span>
              {animeData.duration && (
                <span className="bg-black/40 backdrop-blur-sm text-white border border-red-900/30 px-4 py-2 rounded-full font-medium flex items-center gap-2">
                  <ClockIcon />
                  {animeData.duration} min
                </span>
              )}
              <span className={`px-4 py-2 rounded-full font-medium ${
                animeData.status === 'Ongoing' 
                  ? 'bg-red-600/90 text-white' 
                  : 'bg-red-800/90 text-white'
              }`}>
                {animeData.status}
              </span>
            </div>

            {/* Genres */}
            {animeData.genres && animeData.genres.length > 0 && (
              <div>
                <h3 className="text-white text-lg font-semibold mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {animeData.genres.map((genre, idx) => (
                    <span 
                      key={idx}
                      className="text-sm text-white/80 border border-white/30 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-3">Synopsis</h3>
              <p className="text-gray-300 leading-relaxed">
                {animeData.description?.replace(/<[^>]*>/g, '') || "No description available"}
              </p>
            </div>

            {/* Studios */}
            {animeData.studios && animeData.studios.length > 0 && (
              <div>
                <h3 className="text-white text-lg font-semibold mb-3">Studios</h3>
                <div className="flex flex-wrap gap-2">
                  {animeData.studios.map((studio, idx) => (
                    <span 
                      key={idx}
                      className="text-sm text-white bg-gray-800 px-4 py-2 rounded-lg"
                    >
                      {studio}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Watch Button */}
            <div className="pt-4">
              <button
                className="group flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-red-500/50"
              >
                <span className="group-hover:translate-x-1 transition-transform inline-block">
                  <PlayIcon />
                </span>
                Start Watching
              </button>
            </div>

            {/* Episodes Info */}
            {animeData.totalEpisodes && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                <h3 className="text-white text-lg font-semibold mb-2">Episodes</h3>
                <p className="text-gray-300">
                  Total Episodes: <span className="text-white font-semibold">{animeData.totalEpisodes}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Episodes Section */}
        <div className="mt-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <TvIcon />
              Episodes
            </h2>
            <div className="flex items-center gap-3">
              {episodes.length > 0 && (
                <span className="text-gray-400 text-sm">
                  {episodes.length} episodes
                </span>
              )}
              {/* Provider Selector */}
              <div className="flex items-center gap-2">
                <label className="text-gray-400 text-sm">Provider:</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:border-red-500/50 focus:border-red-500 focus:outline-none transition-all cursor-pointer"
                >
                  {providers.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {episodesLoading && (
            <div className="text-center py-12">
              <div className="text-white text-lg">Loading episodes...</div>
            </div>
          )}

          {episodesError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
              <p className="text-red-400">{episodesError}</p>
            </div>
          )}

          {!episodesLoading && !episodesError && episodes.length === 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
              <p className="text-gray-400">No episodes available yet</p>
            </div>
          )}

          {!episodesLoading && episodes.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedEpisodes.map((episode) => (
                  <div
                    key={episode.episodeId}
                    onClick={() => {
                      if (selectedProvider === 'animepahe') {
                        // For animepahe, use router.push with proper encoding
                        // Don't encode the episodeId here - let Next.js handle it
                        window.location.href = `/animepahe/${episode.episodeId}?animeId=${animeId}`;
                      } else {
                        // For other providers, use generic player
                        const playerUrl = `/player?episodeId=${encodeURIComponent(episode.episodeId)}&provider=${selectedProvider}&animeId=${animeId}`;
                        window.location.href = playerUrl;
                      }
                    }}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden hover:border-red-500/50 transition-all cursor-pointer group"
                  >
                    {episode.thumbnail && (
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={episode.thumbnail}
                          alt={episode.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <PlayIcon />
                        </div>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-red-500 font-semibold text-sm">
                          Episode {episode.episodeNumber}
                        </span>
                        {episode.rating && (
                          <div className="flex items-center gap-1 text-yellow-500 text-sm">
                            <StarIcon />
                            <span>{episode.rating}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-white font-medium text-sm line-clamp-2 mb-2">
                        {episode.title}
                      </h3>
                      {episode.airDate && (
                        <p className="text-gray-400 text-xs flex items-center gap-1">
                          <CalendarIcon />
                          {new Date(episode.airDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {episodes.length > 12 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    {showAllEpisodes ? 'Show Less' : `Show All ${episodes.length} Episodes`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Extra spacing at bottom */}
      <div className="h-20"></div>
    </div>
  );
}

export default AnimeDetailsPage;