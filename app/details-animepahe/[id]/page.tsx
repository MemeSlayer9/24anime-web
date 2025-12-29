"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

interface AnimeDetails {
  id: string;
  malId?: number;
  anilistId?: number;
  name?: string;
  romaji?: string;
  english?: string;
  native?: string;
  userPreferred?: string;
  title?: {
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
  studios?: string[] | Array<{ name: string }>;
  season?: string;
  popularity?: number;
  episodes?: Episode[];
  recommendations?: Recommendation[];
  characters?: Character[];
  relations?: Relation[];
  trailer?: {
    id?: string;
    site?: string;
    thumbnail?: string;
  };
  synonyms?: string[];
  color?: string;
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
  voiceActors?: Array<{
    id: number;
    language: string;
    name: {
      first?: string;
      last?: string;
      full?: string;
      native?: string;
    };
    image: string;
  }>;
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

const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const TvIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
    <polyline points="17 2 12 7 7 2"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

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

function AnimeDetailsPage() {
  const [animeId, setAnimeId] = useState<string>("");
  const [animeData, setAnimeData] = useState<AnimeDetails | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [episodesError, setEpisodesError] = useState<string | null>(null);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  const [activeTab, setActiveTab] = useState<"characters" | "recommendations" | "relations" | "info" | "episodes">("info");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [episodeRange, setEpisodeRange] = useState<string>("all");

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const pathParts = window.location.pathname.split('/');
    const id = hash || pathParts[pathParts.length - 1] || "";
    
    if (id && id !== 'details') {
      setAnimeId(id);
    }
  }, []);

  // Update document title when anime data is loaded
  useEffect(() => {
    if (animeData) {
      // Filter out "Bookmark" prefix from name field
      const getName = () => {
        const name = animeData.name;
        if (name && name.toLowerCase().includes('bookmark')) {
          return null;
        }
        return name;
      };
      
      const title = animeData.title?.english || animeData.title?.romaji || animeData.title?.userPreferred || animeData.english || animeData.romaji || getName() || "Anime Details";
      document.title = `${title} - Anime Details`;
      
      // Update meta description
      const description = animeData.description?.replace(/<[^>]*>/g, '').substring(0, 160) || "Watch anime online";
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = description;
        document.head.appendChild(meta);
      }

      // Update Open Graph meta tags
      const updateOrCreateMeta = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (meta) {
          meta.content = content;
        } else {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          meta.content = content;
          document.head.appendChild(meta);
        }
      };

      updateOrCreateMeta('og:title', title);
      updateOrCreateMeta('og:description', description);
      updateOrCreateMeta('og:image', animeData.image);
      updateOrCreateMeta('og:type', 'video.tv_show');
      
      // Twitter Card meta tags
      const updateOrCreateTwitterMeta = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (meta) {
          meta.content = content;
        } else {
          meta = document.createElement('meta');
          meta.name = name;
          meta.content = content;
          document.head.appendChild(meta);
        }
      };

      updateOrCreateTwitterMeta('twitter:card', 'summary_large_image');
      updateOrCreateTwitterMeta('twitter:title', title);
      updateOrCreateTwitterMeta('twitter:description', description);
      updateOrCreateTwitterMeta('twitter:image', animeData.image);
    }

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'Anime Details';
    };
  }, [animeData]);

  useEffect(() => {
    async function fetchAnimeDetails() {
      if (!animeId) return;

      try {
        setLoading(true);
        setError(null);
        setEpisodesLoading(true);
        setEpisodesError(null);
        
        // Fetch from Kenjitsu API
        const response = await axios.get(
          `https://kenjitsu.vercel.app/api/animepahe/anime/${animeId}`,
          {
            params: { provider: "animepahe" }
          }
        );
        
        // Set anime data from the 'data' property
        if (response.data.data) {
          let mergedData = response.data.data;
          
          // If we have an anilistId, fetch additional data from AniList API
          const anilistId = response.data.data.anilistId;
          if (anilistId) {
            try {
              const anilistResponse = await axios.get(
                `https://makgago.vercel.app/meta/anilist/info/${anilistId}`
              );
              
              // Merge AniList data with existing anime data
              if (anilistResponse.data) {
                mergedData = {
                  ...mergedData,
                  // Add/override with AniList data
                  characters: anilistResponse.data.characters || mergedData.characters || [],
                  recommendations: anilistResponse.data.recommendations || mergedData.recommendations || [],
                  relations: anilistResponse.data.relations || mergedData.relations || [],
                  trailer: anilistResponse.data.trailer || mergedData.trailer,
                  synonyms: anilistResponse.data.synonyms || mergedData.synonyms,
                  color: anilistResponse.data.color || mergedData.color,
                  // Preserve original data for critical fields, fallback to AniList
                  image: mergedData.image || anilistResponse.data.image,
                  cover: mergedData.cover || anilistResponse.data.cover,
                  description: mergedData.description || anilistResponse.data.description,
                };
              }
            } catch (anilistErr) {
              console.error("Error fetching AniList data:", anilistErr);
              // Don't fail the whole request if AniList data fails
            }
          }
          
          setAnimeData(mergedData);
        }
        
        // Set episodes from the 'providerEpisodes' property
        if (response.data.providerEpisodes && Array.isArray(response.data.providerEpisodes)) {
          setEpisodes(response.data.providerEpisodes);
        } else {
          setEpisodes([]);
        }
        
        setEpisodesLoading(false);
      } catch (err) {
        console.error("Error fetching anime details:", err);
        if (axios.isAxiosError(err)) {
          const errorMessage = err.response?.data?.message || err.message || "Failed to load anime details";
          setError(errorMessage);
          setEpisodesError(errorMessage);
        } else {
          setError("Failed to load anime details");
          setEpisodesError("Failed to load episodes");
        }
        setEpisodesLoading(false);
      } finally {
        setLoading(false);
      }
    }

    fetchAnimeDetails();
  }, [animeId]);

  useEffect(() => {
    setActiveTab("episodes");
  }, [animeData]);

  if (!animeId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30">
            <TvIcon />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">No Anime Selected</h2>
          <p className="text-sm text-gray-400 mb-6">Please select an anime from the carousel to view details</p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm px-6 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-red-500/50"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
          <p className="text-red-500 text-sm md:text-base animate-pulse font-semibold">Loading anime details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30">
            <span className="text-red-500 text-3xl font-bold">!</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-red-500 mb-2">Error Loading Anime</h2>
          <p className="text-sm text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm px-6 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-red-500/50"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!animeData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-base">No data available</div>
      </div>
    );
  }

  // Get title, excluding "name" field if it contains "Bookmark"
  const getName = () => {
    const name = animeData.name;
    if (name && name.toLowerCase().includes('bookmark')) {
      return null;
    }
    return name;
  };
  
  const title = animeData.title?.english || animeData.title?.romaji || animeData.title?.userPreferred || animeData.english || animeData.romaji || getName() || "Unknown Title";
  const nativeTitle = animeData.title?.native || animeData.native;
  
  const filteredEpisodes = episodes.filter((episode) => {
    const matchesSearch = searchQuery === "" || 
      episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      episode.episodeNumber.toString().includes(searchQuery);
    
    let matchesRange = true;
    if (episodeRange !== "all") {
      const [start, end] = episodeRange.split("-").map(Number);
      matchesRange = episode.episodeNumber >= start && episode.episodeNumber <= end;
    }
    
    return matchesSearch && matchesRange;
  });
  
  const displayedEpisodes = showAllEpisodes ? filteredEpisodes : filteredEpisodes.slice(0, 12);

  return (
    <div className="min-h-screen bg-black">
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
        <img
          src={animeData.image}
          alt={title}
          className="md:hidden w-full h-full object-cover"
        />
        <img
          src={animeData.cover || animeData.image}
          alt={title}
          className="hidden md:block w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start ml-4 sm:ml-6 md:ml-8 lg:ml-12 xl:ml-30">
            <div className="flex-shrink-0 hidden md:block">
              <img
                src={animeData.image}
                alt={title}
                className="w-36 h-52 lg:w-44 lg:h-64 object-cover rounded-xl shadow-2xl ring-4 ring-red-500/30 transform hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="flex-1 space-y-3 text-center md:text-left mt-8 md:mt-0">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight mb-1 drop-shadow-2xl">
                  {title}
                </h1>
                {nativeTitle && (
                  <p className="text-sm md:text-base text-gray-400 font-light">{nativeTitle}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 md:gap-2">
                {animeData.rating && (
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white px-2.5 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-red-500/50">
                    <StarIcon />
                    <span>{(animeData.rating / 10).toFixed(1)}</span>
                  </div>
                )}
                <span className="bg-black/60 backdrop-blur-xl text-white border-2 border-red-500/50 px-2.5 py-1.5 rounded-full text-xs font-semibold">
                  {animeData.type}
                </span>
                <span className="bg-black/60 backdrop-blur-xl text-white border-2 border-red-500/50 px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                  <CalendarIcon />
                  {animeData.releaseDate}
                </span>
                {animeData.duration && (
                  <span className="bg-black/60 backdrop-blur-xl text-white border-2 border-red-500/50 px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <ClockIcon />
                    {animeData.duration}m
                  </span>
                )}
                <span className={`px-2.5 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 ${
                  animeData.status === 'Ongoing' 
                    ? 'bg-red-600 text-white border-red-500 shadow-red-500/50' 
                    : 'bg-black/60 text-white border-red-500/50'
                }`}>
                  {animeData.status}
                </span>
              </div>

              {animeData.totalEpisodes && (
                <div className="flex justify-center md:justify-start">
                  <div className="inline-block bg-red-500/20 backdrop-blur-xl border-2 border-red-500/50 rounded-lg px-4 py-2">
                    <span className="text-white font-bold text-sm">{animeData.totalEpisodes} Episodes</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                activeTab === "info"
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/50 scale-105"
                  : "text-gray-400 hover:text-white hover:bg-red-500/10 border-2 border-transparent hover:border-red-500/30"
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setActiveTab("episodes")}
              className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "episodes"
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/50 scale-105"
                  : "text-gray-400 hover:text-white hover:bg-red-500/10 border-2 border-transparent hover:border-red-500/30"
              }`}
            >
              Episodes
              {episodes.length > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                  {episodes.length}
                </span>
              )}
            </button>

            {animeData.characters && animeData.characters.length > 0 && (
              <button
                onClick={() => setActiveTab("characters")}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === "characters"
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/50 scale-105"
                    : "text-gray-400 hover:text-white hover:bg-red-500/10 border-2 border-transparent hover:border-red-500/30"
                }`}
              >
                Characters
              </button>
            )}

            {animeData.recommendations && animeData.recommendations.length > 0 && (
              <button
                onClick={() => setActiveTab("recommendations")}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === "recommendations"
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/50 scale-105"
                    : "text-gray-400 hover:text-white hover:bg-red-500/10 border-2 border-transparent hover:border-red-500/30"
                }`}
              >
                Similar
              </button>
            )}

            {animeData.relations && animeData.relations.length > 0 && (
              <button
                onClick={() => setActiveTab("relations")}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === "relations"
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/50 scale-105"
                    : "text-gray-400 hover:text-white hover:bg-red-500/10 border-2 border-transparent hover:border-red-500/30"
                }`}
              >
                Related
              </button>
            )}
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-2xl border-2 border-red-500/20 p-6">
            {activeTab === "info" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-red-500 rounded"></div>
                    Synopsis
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                    {animeData.description?.replace(/<[^>]*>/g, '') || "No description available"}
                  </p>
                </div>

                {animeData.trailer && animeData.trailer.id && (
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-red-500 rounded"></div>
                      Trailer
                    </h3>
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border-2 border-red-500/30">
                      <iframe
                        src={`https://www.youtube.com/embed/${animeData.trailer.id}`}
                        title="Anime Trailer"
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {animeData.genres && animeData.genres.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-red-500 rounded"></div>
                      Genres
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {animeData.genres.map((genre, idx) => (
                        <span
                          key={idx}
                          className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm font-semibold hover:from-red-500/30 hover:to-red-600/30 transition-all"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {animeData.studios && Array.isArray(animeData.studios) && animeData.studios.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-red-500 rounded"></div>
                      Studios
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {animeData.studios.map((studio, idx) => (
                        <span
                          key={idx}
                          className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/50 text-blue-300 px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          {typeof studio === 'string' ? studio : studio.name || 'Unknown Studio'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {animeData.synonyms && animeData.synonyms.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-red-500 rounded"></div>
                      Alternative Titles
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {animeData.synonyms.slice(0, 5).map((synonym, idx) => (
                        <span
                          key={idx}
                          className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/50 text-purple-300 px-3 py-1.5 rounded-lg text-sm"
                        >
                          {synonym}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "episodes" && (
              <div className="space-y-6">
                {episodes.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <SearchIcon />
                      </div>
                      <input
                        type="text"
                        placeholder="Search episodes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm bg-black/60 border-2 border-red-500/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all shadow-lg"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <FilterIcon />
                      </div>
                      <select
                        value={episodeRange}
                        onChange={(e) => setEpisodeRange(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm bg-black/60 border-2 border-red-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 cursor-pointer transition-all shadow-lg appearance-none"
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
                  </div>
                )}

                {episodesLoading && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading episodes...</p>
                  </div>
                )}

                {episodesError && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">⚠️</div>
                    <p className="text-red-400 text-lg">{episodesError}</p>
                  </div>
                )}

                {!episodesLoading && !episodesError && episodes.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📺</div>
                    <h3 className="text-2xl font-bold text-white mb-2">No episodes available</h3>
                    <p className="text-gray-400">Episodes will be available soon</p>
                  </div>
                )}

                {!episodesLoading && episodes.length > 0 && filteredEpisodes.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-bold text-white mb-2">No episodes match your search</h3>
                    <p className="text-gray-400">Try adjusting your filters</p>
                  </div>
                )}

                {!episodesLoading && episodes.length > 0 && filteredEpisodes.length > 0 && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {displayedEpisodes.map((episode) => (
                        <div
                          key={episode.episodeId}
                          onClick={() => {
                            window.location.href = `/Watch/animepahe2/${episode.episodeId}?animeId=${animeId}`;
                          }}
                          className="group bg-black/60 backdrop-blur-sm border-2 border-red-500/20 rounded-lg overflow-hidden hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/40 transition-all cursor-pointer transform hover:scale-105"
                        >
                          {episode.thumbnail && (
                            <div className="relative aspect-video overflow-hidden">
                              <img
                                src={getWeservImage(episode.thumbnail, 400)}
                                alt={episode.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                <div className="bg-red-600 rounded-full p-3 group-hover:scale-110 transition-transform shadow-lg">
                                  <PlayIcon />
                                </div>
                              </div>
                              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                                Ep {episode.episodeNumber}
                              </div>
                            </div>
                          )}
                          <div className="p-3">
                            <h4 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                              {episode.title || `Episode ${episode.episodeNumber}`}
                            </h4>
                            {episode.airDate && (
                              <p className="text-gray-400 text-xs">
                                {new Date(episode.airDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredEpisodes.length > 12 && (
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm px-6 py-2.5 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg shadow-red-500/50 border-2 border-red-500/50"
                        >
                          {showAllEpisodes ? 'Show Less' : `Show All ${filteredEpisodes.length} Episodes`}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "characters" && animeData.characters && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-red-500 rounded"></div>
                  Characters & Voice Actors
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {animeData.characters.slice(0, 20).map((character) => (
                    <div
                      key={character.id}
                      className="group bg-black/60 backdrop-blur-sm border-2 border-red-500/20 rounded-lg overflow-hidden hover:border-red-500 hover:shadow-xl hover:shadow-red-500/20 transition-all"
                    >
                      <div className="flex gap-3 p-3">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-20 md:w-20 md:h-28 overflow-hidden rounded-lg">
                            <img
                              src={getWeservImage(character.image, 200)}
                              alt={character.name.full || character.name.userPreferred}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                            {character.name.full || character.name.userPreferred}
                          </h4>
                          <p className="text-red-400 text-xs capitalize mb-2">{character.role}</p>
                          {character.voiceActors && character.voiceActors.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-red-500/20">
                              {character.voiceActors.slice(0, 1).map((va) => (
                                <div key={va.id} className="flex items-center gap-2">
                                  <div className="w-8 h-8 overflow-hidden rounded-full flex-shrink-0">
                                    <img
                                      src={getWeservImage(va.image, 100)}
                                      alt={va.name.full}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-gray-300 text-xs line-clamp-1">{va.name.full}</p>
                                    <p className="text-gray-500 text-xs">{va.language}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "recommendations" && animeData.recommendations && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-red-500 rounded"></div>
                  You Might Also Like
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {animeData.recommendations.slice(0, 15).map((rec) => {
                    const recTitle = rec.title.english || rec.title.romaji || rec.title.userPreferred || "Unknown Title";
                    return (
                      <div
                        key={rec.id}
                        onClick={() => window.location.href = `/details/${rec.id}`}
                        className="group bg-black/60 backdrop-blur-sm border-2 border-red-500/20 rounded-xl overflow-hidden hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/30 transition-all cursor-pointer transform hover:scale-105"
                      >
                        <div className="relative aspect-[2/3] overflow-hidden">
                          <img
                            src={getWeservImage(rec.image, 400)}
                            alt={recTitle}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {rec.rating && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                              <StarIcon />
                              {(rec.rating / 10).toFixed(1)}
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3">
                            <h4 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                              {recTitle}
                            </h4>
                            <p className="text-gray-400 text-xs">{rec.type} • {rec.episodes || '?'} eps</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "relations" && animeData.relations && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-red-500 rounded"></div>
                  Related Anime
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {animeData.relations
                    .filter((relation) => relation.type !== "MANGA" && relation.type !== "NOVEL" && relation.type !== "MUSIC")
                    .map((relation) => {
                      const relTitle = relation.title.english || relation.title.romaji || relation.title.userPreferred || "Unknown Title";
                      return (
                        <div
                          key={relation.id}
                          onClick={() => window.location.href = `/details/${relation.id}`}
                          className="group bg-black/60 backdrop-blur-sm border-2 border-red-500/20 rounded-xl overflow-hidden hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/30 transition-all cursor-pointer transform hover:scale-105"
                        >
                          <div className="relative aspect-[2/3] overflow-hidden">
                            <img
                              src={getWeservImage(relation.image, 400)}
                              alt={relTitle}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded uppercase">
                              {relation.relationType.replace(/_/g, ' ')}
                            </div>
                            {relation.rating && (
                              <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                <StarIcon />
                                {(relation.rating / 10).toFixed(1)}
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3">
                              <h4 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                                {relTitle}
                              </h4>
                              <p className="text-gray-400 text-xs">
                                {relation.type} {relation.episodes && `• ${relation.episodes} eps`}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-12"></div>
    </div>
  );
}

export default AnimeDetailsPage;