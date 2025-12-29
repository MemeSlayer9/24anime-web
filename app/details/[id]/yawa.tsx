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

interface AnimekaiEpisode {
  id: string;
  number: number;
  title?: string;
  thumbnail?: string;
}

interface AnimekaiEpisodeResponse {
  episodeId?: string;
  id?: string;
  episodeNumber?: number;
  number?: number;
  title?: string;
  thumbnail?: string;
  image?: string;
  overview?: string;
  rating?: string;
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
    let weservUrl = `https://images.weserv.nl/?url=${encodedUrl}`;
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
  const [animekaiEpisodes, setAnimekaiEpisodes] = useState<AnimekaiEpisode[]>([]);
  const [animekaiAnimeId, setAnimekaiAnimeId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [episodesError, setEpisodesError] = useState<string | null>(null);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("hianime");
  const [activeTab, setActiveTab] = useState<"characters" | "recommendations" | "relations" | "info" | "episodes">("info");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [episodeRange, setEpisodeRange] = useState<string>("all");

  const providers = ["hianime", "allanime", "animepahe", "anizone", "animekai"];

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const pathParts = window.location.pathname.split('/');
    const id = hash || pathParts[pathParts.length - 1] || "";
    
    if (id && id !== 'details') {
      setAnimeId(id);
    }
  }, []);

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

  const fetchAnimekaiAnimeDetails = async (animekaiId: string) => {
    try {
      console.log(`Fetching Animekai anime details for ID: ${animekaiId}`);
      const detailsResponse = await fetch(
        `https://kenjitsu.vercel.app/api/animekai/anime/${animekaiId}`
      );
      
      if (!detailsResponse.ok) {
        throw new Error(`HTTP error! status: ${detailsResponse.status}`);
      }
      
      const detailsData = await detailsResponse.json();
      console.log('Animekai Details Response:', detailsData);
      
      const episodes = detailsData?.providerEpisodes || 
                      detailsData?.data?.episodes || 
                      detailsData?.episodes;
      
      if (episodes && Array.isArray(episodes)) {
        const mappedEpisodes = episodes.map((ep: AnimekaiEpisodeResponse) => ({
          id: ep.episodeId || ep.id || '',
          number: ep.episodeNumber || ep.number || 0,
          title: ep.title || `Episode ${ep.episodeNumber || ep.number}`,
          thumbnail: ep.thumbnail || ep.image || animeData?.image,
          overview: ep.overview,
          rating: ep.rating
        }));
        
        console.log(`Fetched ${mappedEpisodes.length} Animekai episodes`);
        setAnimekaiEpisodes(mappedEpisodes);
      } else {
        console.log('No episodes found in anime details');
        setAnimekaiEpisodes([]);
      }
    } catch (error) {
      console.error("Error fetching Animekai anime details:", error);
      setAnimekaiEpisodes([]);
    }
  };

  const fetchAnimekaiEpisodes = async () => {
    try {
      console.log(`Fetching Animekai data for Anilist ID: ${animeId}`);
      
      const animeTitle = animeData?.title?.romaji || animeData?.title?.english;
      
      if (!animeTitle) {
        console.log('No anime title available yet, waiting...');
        return;
      }
      
      console.log(`Searching Animekai with title: ${animeTitle}`);
      
      const searchResponse = await fetch(
        `https://kenjitsu.vercel.app/api/animekai/anime/search?q=${encodeURIComponent(animeTitle)}`
      );
      
      if (!searchResponse.ok) {
        throw new Error(`HTTP error! status: ${searchResponse.status}`);
      }
      
      const searchData = await searchResponse.json();
      console.log('Animekai Search Response:', searchData);
      
      const results = searchData?.data || [];
      
      if (results.length === 0) {
        console.log('No search results found');
        setAnimekaiEpisodes([]);
        return;
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let matchedAnime = results.find((result: any) => 
        result.romaji === animeTitle || result.name === animeTitle
      );
      
      if (!matchedAnime && results.length > 0) {
        matchedAnime = results[0];
        console.log(`Using first search result: ${matchedAnime.name}`);
      }
      
      if (!matchedAnime) {
        console.log(`No Animekai anime found for: ${animeTitle}`);
        setAnimekaiEpisodes([]);
        return;
      }
      
      const animekaiId = matchedAnime.id;
      console.log(`Found Animekai anime with ID: ${animekaiId}`);
      setAnimekaiAnimeId(animekaiId);
      
      if (matchedAnime.episodes && Array.isArray(matchedAnime.episodes)) {
        console.log(`Using episodes from search result: ${matchedAnime.episodes.length} episodes`);
        setAnimekaiEpisodes(matchedAnime.episodes);
      } else {
        await fetchAnimekaiAnimeDetails(animekaiId);
      }
    } catch (error) {
      console.error("Error fetching Animekai data:", error);
      setAnimekaiEpisodes([]);
    }
  };

  useEffect(() => {
    async function fetchEpisodes() {
      if (!animeId) return;
      
      try {
        setEpisodesLoading(true);
        setEpisodesError(null);
        
        if (selectedProvider === 'animekai') {
          await fetchAnimekaiEpisodes();
        } else {
          const response = await fetch(`https://kenjitsu.vercel.app/api/anilist/episodes/${animeId}?provider=${selectedProvider}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.providerEpisodes && Array.isArray(data.providerEpisodes)) {
            setEpisodes(data.providerEpisodes);
          } else {
            setEpisodes([]);
          }
        }
      } catch (err) {
        console.error("Error fetching episodes:", err);
        setEpisodesError(err instanceof Error ? err.message : "Failed to load episodes");
      } finally {
        setEpisodesLoading(false);
      }
    }

    fetchEpisodes();
  }, [animeId, selectedProvider, animeData]);

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
          <img 
            src="/loading.gif" 
            alt="Loading..." 
            className="w-48 h-48 md:w-64 md:h-64 object-contain"
            style={{ 
              mixBlendMode: 'screen',
              filter: 'contrast(1.2) brightness(1.1)'
            }}
          />
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

  const title = animeData.title.english || animeData.title.romaji || animeData.title.userPreferred || "Unknown Title";
  
  const currentEpisodes = selectedProvider === 'animekai' ? animekaiEpisodes : episodes;
  const episodeCount = selectedProvider === 'animekai' ? animekaiEpisodes.length : episodes.length;
  
  const filteredEpisodes = currentEpisodes.filter((episode: Episode | AnimekaiEpisode) => {
    const episodeNumber = selectedProvider === 'animekai' ? (episode as AnimekaiEpisode).number : (episode as Episode).episodeNumber;
    const episodeTitle = selectedProvider === 'animekai' ? ((episode as AnimekaiEpisode).title || `Episode ${(episode as AnimekaiEpisode).number}`) : (episode as Episode).title;
    
    const matchesSearch = searchQuery === "" || 
      episodeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      episodeNumber.toString().includes(searchQuery);
    
    let matchesRange = true;
    if (episodeRange !== "all") {
      const [start, end] = episodeRange.split("-").map(Number);
      matchesRange = episodeNumber >= start && episodeNumber <= end;
    }
    
    return matchesSearch && matchesRange;
  });
  
  const displayedEpisodes = showAllEpisodes ? filteredEpisodes : filteredEpisodes.slice(0, 12);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
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
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <div className="container mx-auto flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-end">
            {/* Poster */}
            <div className="flex-shrink-0 hidden md:block">
              <img
                src={animeData.image}
                alt={title}
                className="w-36 h-52 lg:w-44 lg:h-64 object-cover rounded-xl shadow-2xl ring-4 ring-red-500/30 transform hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Title and Meta */}
            <div className="flex-1 space-y-3 text-center md:text-left mt-8 md:mt-0">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight mb-1 drop-shadow-2xl">
                  {title}
                </h1>
                {animeData.title.native && (
                  <p className="text-sm md:text-base text-gray-400 font-light">{animeData.title.native}</p>
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

      {/* Main Content */}
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8">
        {/* Tabs Section */}
        <div className="bg-black/80 backdrop-blur-xl border-2 border-red-500/30 rounded-xl overflow-hidden shadow-2xl mb-6">
          {/* Tab Headers */}
          <div className="flex gap-1.5 p-1.5 border-b-2 border-red-500/30 overflow-x-auto bg-black/40">
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
              <TvIcon />
              Episodes
              {episodeCount > 0 && (
                <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full text-xs font-bold border border-red-500/50">
                  {episodeCount}
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

          {/* Tab Content */}
          <div className="p-4 md:p-6">
            {/* Info Tab */}
            {activeTab === "info" && (
              <div className="space-y-6">
                {/* Synopsis */}
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-red-500 to-red-700 rounded-full"></span>
                    Synopsis
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                    {animeData.description?.replace(/<[^>]*>/g, '') || "No description available"}
                  </p>
                </div>

                {/* Genres */}
                {animeData.genres && animeData.genres.length > 0 && (
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-gradient-to-b from-red-500 to-red-700 rounded-full"></span>
                      Genres
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {animeData.genres.map((genre, idx) => (
                        <span 
                          key={idx}
                          className="bg-red-500/10 backdrop-blur-sm text-white border-2 border-red-500/50 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-500/20 hover:border-red-500 transition-all transform hover:scale-105 shadow-lg"
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
                    <h3 className="text-base md:text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-gradient-to-b from-red-500 to-red-700 rounded-full"></span>
                      Studios
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {animeData.studios.map((studio, idx) => (
                        <span 
                          key={idx}
                          className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg border-2 border-red-500/30 text-xs font-semibold shadow-lg shadow-red-500/10"
                        >
                          {studio}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Episodes Tab */}
            {activeTab === "episodes" && (
              <div className="space-y-4">
                {/* Provider Selection */}
                {episodeCount > 0 && (
                  <div>
                    <label className="text-red-400 text-xs font-semibold mb-1.5 block">Select Provider</label>
                    <select
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value)}
                      className="w-full md:w-48 bg-black/60 text-white text-sm border-2 border-red-500/50 rounded-lg px-3 py-2 font-semibold hover:border-red-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all cursor-pointer shadow-lg"
                    >
                      {providers.map((provider) => (
                        <option key={provider} value={provider} className="bg-black">
                          {provider.charAt(0).toUpperCase() + provider.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Search and Filter */}
                {episodeCount > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search episodes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm bg-black/60 border-2 border-red-500/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all shadow-lg"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400 pointer-events-none">
                        <SearchIcon />
                      </div>
                    </div>
                    
                    <div className="relative">
                      <select
                        value={episodeRange}
                        onChange={(e) => setEpisodeRange(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm bg-black/60 border-2 border-red-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 cursor-pointer transition-all shadow-lg appearance-none"
                      >
                        <option value="all" className="bg-black">All Episodes</option>
                        {(() => {
                          const ranges = [];
                          const totalEpisodes = episodeCount;
                          for (let i = 1; i <= totalEpisodes; i += 25) {
                            const end = Math.min(i + 24, totalEpisodes);
                            ranges.push(
                              <option key={`${i}-${end}`} value={`${i}-${end}`} className="bg-black">
                                Episodes {i}-{end}
                              </option>
                            );
                          }
                          return ranges;
                        })()}
                      </select>
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400 pointer-events-none">
                        <FilterIcon />
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {episodesLoading && (
                  <div className="flex flex-col justify-center items-center py-12">
                    <img 
                      src="/loading.gif" 
                      alt="Loading..." 
                      className="w-32 h-32 md:w-40 md:h-40 object-contain mb-3"
                      style={{ 
                        mixBlendMode: 'screen',
                        filter: 'contrast(1.2) brightness(1.1)'
                      }}
                    />
                    <p className="text-red-500 text-sm animate-pulse font-semibold">Loading episodes...</p>
                  </div>
                )}

                {/* Error State */}
                {episodesError && (
                  <div className="bg-red-500/10 border-2 border-red-500/50 rounded-lg p-6 text-center backdrop-blur-sm">
                    <div className="w-12 h-12 mx-auto mb-3 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/50">
                      <span className="text-red-500 text-xl font-bold">!</span>
                    </div>
                    <p className="text-red-400 text-sm font-semibold">{episodesError}</p>
                  </div>
                )}

                {/* No Episodes */}
                {!episodesLoading && !episodesError && episodeCount === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="text-6xl mb-4">📺</div>
                    <p className="text-gray-400 text-lg mb-2">No episodes available for {selectedProvider}</p>
                    <p className="text-gray-500 text-sm mb-6">Try selecting a different provider above</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {providers
                        .filter(p => p !== selectedProvider)
                        .map((provider) => (
                          <button
                            key={provider}
                            onClick={() => setSelectedProvider(provider)}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg shadow-red-500/50"
                          >
                            Try {provider.charAt(0).toUpperCase() + provider.slice(1)}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* No Search Results */}
                {!episodesLoading && episodeCount > 0 && filteredEpisodes.length === 0 && (
                  <div className="bg-black/60 border-2 border-red-500/30 rounded-lg p-8 text-center backdrop-blur-sm">
                    <div className="w-16 h-16 mx-auto mb-3 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30">
                      <SearchIcon />
                    </div>
                    <p className="text-white text-sm font-semibold">No episodes match your search</p>
                    <p className="text-gray-400 text-xs mt-1">Try adjusting your filters</p>
                  </div>
                )}

                {/* Episodes Grid */}
                {!episodesLoading && episodeCount > 0 && filteredEpisodes.length > 0 && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
                      {displayedEpisodes.map((episode: Episode | AnimekaiEpisode) => {
                        const episodeNumber = selectedProvider === 'animekai' ? (episode as AnimekaiEpisode).number : (episode as Episode).episodeNumber;
                        const episodeId = selectedProvider === 'animekai' ? (episode as AnimekaiEpisode).id : (episode as Episode).episodeId;
                        const episodeTitle = selectedProvider === 'animekai' ? ((episode as AnimekaiEpisode).title || `Episode ${(episode as AnimekaiEpisode).number}`) : (episode as Episode).title;
                        const episodeThumbnail = selectedProvider === 'animekai' ? (episode as AnimekaiEpisode).thumbnail : (episode as Episode).thumbnail;
                        const episodeAirDate = selectedProvider === 'animekai' ? null : (episode as Episode).airDate;
                        
                        return (
                          <div
                            key={episodeId}
                            onClick={() => {
                              if (selectedProvider === 'animekai') {
                                window.location.href = `/Watch/animekai/${episodeId}?animeId=${animekaiAnimeId}`;
                              } else if (selectedProvider === 'animepahe') {
                                window.location.href = `/Watch/animepahe/${episodeId}?animeId=${animeId}`;
                              } else if (selectedProvider === 'hianime') {
                                window.location.href = `/Watch/hianime/${episodeId}?animeId=${animeId}`;
                              } else {
                                const playerUrl = `/Watch/Player/episodeId=${encodeURIComponent(episodeId)}&provider=${selectedProvider}&animeId=${animeId}`;
                                window.location.href = playerUrl;
                              }
                            }}
                            className="group bg-black/60 backdrop-blur-sm border-2 border-red-500/20 rounded-lg overflow-hidden hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/40 transition-all cursor-pointer transform hover:scale-105"
                          >
                            {episodeThumbnail && (
                              <div className="relative aspect-video overflow-hidden">
                                <img
                                  src={selectedProvider === 'animepahe' ? getWeservImage(episodeThumbnail, 400) : episodeThumbnail}
                                  alt={episodeTitle}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-2xl shadow-red-500/50 border-2 border-white/20">
                                    <PlayIcon />
                                  </div>
                                </div>
                                <div className="absolute top-1.5 left-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg shadow-red-500/50">
                                  Ep {episodeNumber}
                                </div>
                              </div>
                            )}
                            {!episodeThumbnail && (
                              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-red-900/20 to-black flex items-center justify-center">
                                <div className="text-red-500/50 text-4xl font-bold">{episodeNumber}</div>
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-2xl shadow-red-500/50 border-2 border-white/20">
                                    <PlayIcon />
                                  </div>
                                </div>
                                <div className="absolute top-1.5 left-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg shadow-red-500/50">
                                  Ep {episodeNumber}
                                </div>
                              </div>
                            )}
                            <div className="p-2.5 bg-black/80">
                              <h3 className="text-white font-semibold text-xs line-clamp-2 mb-1 group-hover:text-red-400 transition-colors">
                                {episodeTitle}
                              </h3>
                              {episodeAirDate && (
                                <p className="text-gray-400 text-xs flex items-center gap-1">
                                  <CalendarIcon />
                                  {new Date(episodeAirDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Show More Button */}
                    {filteredEpisodes.length > 12 && (
                      <div className="text-center mt-6">
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

            {/* Characters Tab */}
            {activeTab === "characters" && animeData.characters && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-2 md:gap-3">
                {animeData.characters.slice(0, 18).map((character) => (
                  <div
                    key={character.id}
                    className="group bg-black/60 backdrop-blur-sm border-2 border-red-500/20 rounded-lg overflow-hidden hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/30 transition-all cursor-pointer transform hover:scale-105"
                  >
                    <div className="relative w-full" style={{ paddingTop: '140%' }}>
                      <img
                        src={character.image}
                        alt={character.name.full || character.name.userPreferred}
                        className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-1.5 bg-black/80">
                      <h3 className="text-white font-semibold text-xs line-clamp-2 mb-0.5">
                        {character.name.full || character.name.userPreferred}
                      </h3>
                      <p className="text-red-400 text-xs font-medium">
                        {character.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === "recommendations" && animeData.recommendations && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
                {animeData.recommendations.slice(0, 10).map((rec) => {
                  const recTitle = rec.title.english || rec.title.romaji || rec.title.userPreferred || "Unknown Title";
                  return (
                    <div
                      key={rec.id}
                      onClick={() => window.location.href = `/details/${rec.id}`}
                      className="group bg-black/60 backdrop-blur-sm border-2 border-red-500/20 rounded-xl overflow-hidden hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/30 transition-all cursor-pointer transform hover:scale-105"
                    >
                      <div className="relative w-full" style={{ paddingTop: '150%' }}>
                        <img
                          src={rec.image}
                          alt={recTitle}
                          className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {rec.rating && (
                          <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white px-1.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-red-500/50">
                            <StarIcon />
                            {(rec.rating / 10).toFixed(1)}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-2 bg-black/80">
                        <h3 className="text-white font-semibold text-xs line-clamp-2 mb-0.5">
                          {recTitle}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="font-medium">{rec.type}</span>
                          <span className="font-medium text-red-400">{rec.episodes} eps</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Relations Tab */}
            {activeTab === "relations" && animeData.relations && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
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
                      <div className="relative w-full" style={{ paddingTop: '150%' }}>
                        <img
                          src={relation.image}
                          alt={relTitle}
                          className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white px-1.5 py-0.5 rounded-full text-xs font-bold shadow-lg shadow-red-500/50">
                          {relation.relationType}
                        </div>
                        {relation.rating && (
                          <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white px-1.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-red-500/50">
                            <StarIcon />
                            {(relation.rating / 10).toFixed(1)}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-2 bg-black/80">
                        <h3 className="text-white font-semibold text-xs line-clamp-2 mb-0.5">
                          {relTitle}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="font-medium">{relation.type}</span>
                          {relation.episodes && <span className="font-medium text-red-400">{relation.episodes} eps</span>}
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

      {/* Footer Spacing */}
      <div className="h-12"></div>
    </div>
  );
}

export default AnimeDetailsPage;