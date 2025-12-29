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
  recommendations?: Recommendation[];
  characters?: Character[];
  relations?: Relation[];
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

interface Recommendation {
  id: number;
  malId?: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
    userPreferred?: string;
  };
  status: string;
  episodes: number;
  image: string;
  cover?: string;
  rating?: number;
  type: string;
}

interface Character {
  id: number;
  role: string;
  name: {
    first?: string;
    last?: string;
    full?: string;
    native?: string;
    userPreferred?: string;
  };
  image: string;
}

interface Relation {
  id: number;
  relationType: string;
  malId?: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
    userPreferred?: string;
  };
  status: string;
  episodes?: number;
  image: string;
  color?: string;
  type: string;
  cover?: string;
  rating?: number;
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

// Image proxy helper for animepahe
const getWeservImage = (imageUrl: string, width?: number): string => {
  if (!imageUrl) return '';
  try {
    const encodedUrl = encodeURIComponent(imageUrl);
    let weservUrl = `https://images.weserv.nl/?url=${encodedUrl}`;
    if (width) {
      weservUrl += `&w=${width}&fit=cover`;
    }
    return weservUrl;
  } catch {
    return imageUrl;
  }
};

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
  const [activeTab, setActiveTab] = useState<"characters" | "recommendations" | "relations" | "info">("info");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [episodeRange, setEpisodeRange] = useState<string>("all");

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

  // Set initial active tab to info
  useEffect(() => {
    setActiveTab("info");
  }, [animeData]);

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
        <div className="flex flex-col items-center gap-4">
          <img 
            src="/loading.gif" 
            alt="Loading..." 
            className="w-64 h-64 object-contain"
            style={{ 
              mixBlendMode: 'screen',
              filter: 'contrast(1.2) brightness(1.1)'
            }}
          />
        </div>
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
  
  // Filter episodes based on search and range
  const filteredEpisodes = episodes.filter((episode) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      episode.episodeNumber.toString().includes(searchQuery);
    
    // Range filter
    let matchesRange = true;
    if (episodeRange !== "all") {
      const [start, end] = episodeRange.split("-").map(Number);
      matchesRange = episode.episodeNumber >= start && episode.episodeNumber <= end;
    }
    
    return matchesSearch && matchesRange;
  });
  
  const displayedEpisodes = showAllEpisodes ? filteredEpisodes : filteredEpisodes.slice(0, 12);

  return (
    <div className="min-h-screen bg-[#0a0a0a] md:m-12"> 
          {/* Hero Section with Cover */}
      <div className="relative w-full h-[600px] sm:h-[400px] md:h-[500px]">
        {/* Small screens - use image */}
        <img
          src={animeData.image}
          alt={title}
          className="md:hidden w-full h-full object-cover"
        />
        {/* Large screens - use cover */}
        <img
          src={animeData.cover || animeData.image}
          alt={title}
          className="hidden md:block w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/120 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#0a0a0a]/120 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/100 via-transparent to-transparent" />
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 sm:px-6 -mt-32 sm:-mt-48 md:-mt-64 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster - Hidden on small screens */}
          <div className="hidden md:block flex-shrink-0">
            <img
              src={animeData.image}
              alt={title}
              className="w-48 h-72 lg:w-64 lg:h-96 object-cover rounded-lg shadow-2xl"
            />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4 md:space-y-6">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              {title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              {animeData.rating && (
                <div className="flex items-center gap-1 md:gap-2 bg-yellow-500/90 text-black px-3 md:px-4 py-1.5 md:py-2 rounded-full font-semibold text-sm md:text-base">
                  <StarIcon />
                  <span>{(animeData.rating / 10).toFixed(1)}</span>
                </div>
              )}
              <span className="bg-black/40 backdrop-blur-sm text-white border border-red-900/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium text-xs md:text-sm">
                {animeData.type}
              </span>
              <span className="bg-black/40 backdrop-blur-sm text-white border border-red-900/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <CalendarIcon />
                {animeData.releaseDate}
              </span>
              {animeData.duration && (
                <span className="bg-black/40 backdrop-blur-sm text-white border border-red-900/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                  <ClockIcon />
                  {animeData.duration} min
                </span>
              )}
              <span className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium text-xs md:text-sm ${
                animeData.status === 'Ongoing' 
                  ? 'bg-red-600/90 text-white' 
                  : 'bg-red-800/90 text-white'
              }`}>
                {animeData.status}
              </span>
            </div>

            {/* Episodes Info */}
            {animeData.totalEpisodes && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-3 md:p-4">
                <h3 className="text-white text-base md:text-lg font-semibold mb-1 md:mb-2">Episodes</h3>
                <p className="text-gray-300 text-sm md:text-base">
                  Total Episodes: <span className="text-white font-semibold">{animeData.totalEpisodes}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Combined Section: Synopsis/Genres/Studios and Tabs */}
        <div className="mt-8 md:mt-12 bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
          {/* Tabs Section - Characters, Recommendations, Relations, Synopsis, Genres, Studios */}
          <div>
            {/* Tab Headers */}
            <div className="flex gap-2 md:gap-4 px-4 md:px-6 py-3 md:py-4 border-b border-gray-700 overflow-x-auto">
              <button
                onClick={() => setActiveTab("info")}
                className={`px-4 md:px-6 py-2 md:py-3 font-semibold text-sm md:text-base transition-all whitespace-nowrap rounded-lg ${
                  activeTab === "info"
                    ? "text-white bg-red-500/20 border-b-2 border-red-500"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/30"
                }`}
              >
                Info
              </button>
              {animeData.characters && animeData.characters.length > 0 && (
                <button
                  onClick={() => setActiveTab("characters")}
                  className={`px-4 md:px-6 py-2 md:py-3 font-semibold text-sm md:text-base transition-all whitespace-nowrap rounded-lg ${
                    activeTab === "characters"
                      ? "text-white bg-red-500/20 border-b-2 border-red-500"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/30"
                  }`}
                >
                  Characters
                </button>
              )}
              {animeData.recommendations && animeData.recommendations.length > 0 && (
                <button
                  onClick={() => setActiveTab("recommendations")}
                  className={`px-4 md:px-6 py-2 md:py-3 font-semibold text-sm md:text-base transition-all whitespace-nowrap rounded-lg ${
                    activeTab === "recommendations"
                      ? "text-white bg-red-500/20 border-b-2 border-red-500"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/30"
                  }`}
                >
                  Recommendations
                </button>
              )}
              {animeData.relations && animeData.relations.length > 0 && (
                <button
                  onClick={() => setActiveTab("relations")}
                  className={`px-4 md:px-6 py-2 md:py-3 font-semibold text-sm md:text-base transition-all whitespace-nowrap rounded-lg ${
                    activeTab === "relations"
                      ? "text-white bg-red-500/20 border-b-2 border-red-500"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/30"
                  }`}
                >
                  Relations
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="p-4 md:p-6">
              {/* Info Tab - Combined Synopsis, Genres, Studios */}
              {activeTab === "info" && (
                <div className="space-y-6">
                  {/* Synopsis */}
                  <div>
                    <h3 className="text-white text-xl md:text-2xl font-bold mb-3 md:mb-4">Synopsis</h3>
                    <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                      {animeData.description?.replace(/<[^>]*>/g, '') || "No description available"}
                    </p>
                  </div>

                  {/* Genres */}
                  {animeData.genres && animeData.genres.length > 0 && (
                    <div>
                      <h3 className="text-white text-lg md:text-xl font-semibold mb-3">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {animeData.genres.map((genre, idx) => (
                          <span 
                            key={idx}
                            className="text-xs md:text-sm text-white/80 border border-white/30 px-3 md:px-4 py-1.5 md:py-2 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Studios */}
                  {animeData.studios && animeData.studios.length > 0 && (
                    <div>
                      <h3 className="text-white text-lg md:text-xl font-semibold mb-3">Studios</h3>
                      <div className="flex flex-wrap gap-2">
                        {animeData.studios.map((studio, idx) => (
                          <span 
                            key={idx}
                            className="text-xs md:text-sm text-white bg-gray-700/50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-gray-600"
                          >
                            {studio}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Characters Tab */}
              {activeTab === "characters" && animeData.characters && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {animeData.characters.slice(0, 18).map((character) => (
                    <div
                      key={character.id}
                      className="bg-gray-700/30 border border-gray-600 rounded-lg overflow-hidden hover:border-red-500/50 transition-all group"
                    >
                      <div className="relative w-full" style={{ paddingTop: '150%' }}>
                        <img
                          src={character.image}
                          alt={character.name.full || character.name.userPreferred}
                          className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-2 md:p-3">
                        <h3 className="text-white font-medium text-xs md:text-sm line-clamp-2 mb-1">
                          {character.name.full || character.name.userPreferred}
                        </h3>
                        <p className="text-gray-400 text-xs">
                          {character.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations Tab */}
              {activeTab === "recommendations" && animeData.recommendations && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {animeData.recommendations.slice(0, 10).map((rec) => {
                    const recTitle = rec.title.english || rec.title.romaji || rec.title.userPreferred || "Unknown Title";
                    return (
                      <div
                        key={rec.id}
                        onClick={() => window.location.href = `/details/${rec.id}`}
                        className="bg-gray-700/30 border border-gray-600 rounded-lg overflow-hidden hover:border-red-500/50 transition-all cursor-pointer group"
                      >
                        <div className="relative w-full" style={{ paddingTop: '150%' }}>
                          <img
                            src={rec.image}
                            alt={recTitle}
                            className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {rec.rating && (
                            <div className="absolute top-2 right-2 bg-yellow-500/90 text-black px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <StarIcon />
                              {(rec.rating / 10).toFixed(1)}
                            </div>
                          )}
                        </div>
                        <div className="p-2 md:p-3">
                          <h3 className="text-white font-medium text-xs md:text-sm line-clamp-2 mb-1">
                            {recTitle}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{rec.type}</span>
                            <span>{rec.episodes} eps</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Relations Tab */}
              {activeTab === "relations" && animeData.relations && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {animeData.relations
                    .filter((relation) => relation.type !== "MANGA" && relation.type !== "NOVEL" && relation.type !== "MUSIC")
                    .map((relation) => {
                    const relTitle = relation.title.english || relation.title.romaji || relation.title.userPreferred || "Unknown Title";
                    return (
                      <div
                        key={relation.id}
                        onClick={() => window.location.href = `/details/${relation.id}`}
                        className="bg-gray-700/30 border border-gray-600 rounded-lg overflow-hidden hover:border-red-500/50 transition-all cursor-pointer group"
                      >
                        <div className="relative w-full" style={{ paddingTop: '150%' }}>
                          <img
                            src={relation.image}
                            alt={relTitle}
                            className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 bg-red-600/90 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            {relation.relationType}
                          </div>
                          {relation.rating && (
                            <div className="absolute top-2 right-2 bg-yellow-500/90 text-black px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <StarIcon />
                              {(relation.rating / 10).toFixed(1)}
                            </div>
                          )}
                        </div>
                        <div className="p-2 md:p-3">
                          <h3 className="text-white font-medium text-xs md:text-sm line-clamp-2 mb-1">
                            {relTitle}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{relation.type}</span>
                            {relation.episodes && <span>{relation.episodes} eps</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        
        </div>

        {/* Episodes Section */}
<div className="mt-8 md:mt-16">
  <div className="mb-4 md:mb-6">
    <div className="flex items-center justify-between mb-3 md:mb-4">
      <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 md:gap-3">
        <TvIcon />
        Episodes
      </h2>
      {episodes.length > 0 && (
        <span className="text-gray-400 text-xs md:text-sm">
          {filteredEpisodes.length}/{episodes.length}
        </span>
      )}
    </div>
    
    {episodes.length > 0 && (
      <div className="flex items-center gap-2 mb-3">
        <label className="text-gray-400 text-xs md:text-sm whitespace-nowrap">Provider:</label>
        <select
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-1.5 text-xs md:text-sm font-medium hover:border-red-500/50 focus:border-red-500 focus:outline-none transition-all cursor-pointer"
        >
          {providers.map((provider) => (
            <option key={provider} value={provider}>
              {provider.charAt(0).toUpperCase() + provider.slice(1)}
            </option>
          ))}
        </select>
      </div>
    )}
  </div>

  {/* Search and Filter Controls */}
  {episodes.length > 0 && (
    <div className="flex flex-col gap-2 mb-4 md:mb-6">
      <input
        type="text"
        placeholder="Search episode..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
      />
      
      <select
        value={episodeRange}
        onChange={(e) => setEpisodeRange(e.target.value)}
        className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer text-sm"
      >
        <option value="all">All Episodes</option>
        {(() => {
          const ranges = [];
          const totalEpisodes = episodes.length;
          for (let i = 1; i <= totalEpisodes; i += 25) {
            const end = Math.min(i + 24, totalEpisodes);
            ranges.push(
              <option key={`${i}-${end}`} value={`${i}-${end}`}>
                Episodes {i}-{end}
              </option>
            );
          }
          return ranges;
        })()}
      </select>
    </div>
  )}

  {episodesLoading && (
    <div className="flex justify-center items-center py-12">
      <img 
        src="/loading.gif" 
        alt="Loading..." 
        className="w-64 h-64 object-contain"
        style={{ 
          mixBlendMode: 'screen',
          filter: 'contrast(1.2) brightness(1.1)'
        }}
      />
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

  {!episodesLoading && episodes.length > 0 && filteredEpisodes.length === 0 && (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
      <p className="text-gray-400">No episodes match your search</p>
    </div>
  )}

  {!episodesLoading && episodes.length > 0 && filteredEpisodes.length > 0 && (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {displayedEpisodes.map((episode) => (
          <div
            key={episode.episodeId}
            onClick={() => {
              if (selectedProvider === 'animepahe') {
                window.location.href = `/Watch/animepahe/${episode.episodeId}?animeId=${animeId}`;
              } else if (selectedProvider === 'hianime') {
                window.location.href = `/Watch/hianime/${episode.episodeId}?animeId=${animeId}`;
              } else {
                const playerUrl = `/player?episodeId=${encodeURIComponent(episode.episodeId)}&provider=${selectedProvider}&animeId=${animeId}`;
                window.location.href = playerUrl;
              }
            }}
            className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden hover:border-red-500/50 transition-all cursor-pointer group"
          >
            {episode.thumbnail && (
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={selectedProvider === 'animepahe' ? getWeservImage(episode.thumbnail, 400) : episode.thumbnail}
                  alt={episode.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PlayIcon />
                </div>
              </div>
            )}
            <div className="p-2 md:p-4">
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <span className="text-red-500 font-semibold text-xs md:text-sm">
                  Ep {episode.episodeNumber}
                </span>
              </div>
              <h3 className="text-white font-medium text-xs md:text-sm line-clamp-2 mb-1 md:mb-2">
                {episode.title}
              </h3>
              {episode.airDate && (
                <p className="text-gray-400 text-xs hidden md:flex items-center gap-1">
                  <CalendarIcon />
                  {new Date(episode.airDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredEpisodes.length > 12 && (
        <div className="text-center mt-6 md:mt-8">
          <button
            onClick={() => setShowAllEpisodes(!showAllEpisodes)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all text-sm md:text-base"
          >
            {showAllEpisodes ? 'Show Less' : `Show All ${filteredEpisodes.length} Episodes`}
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