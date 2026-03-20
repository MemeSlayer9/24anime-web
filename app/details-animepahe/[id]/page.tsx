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
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const StarIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const TvIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
    <polyline points="17 2 12 7 7 2"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
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
        
         const response = await axios.get(
          `https://diddyepstein-delta.vercel.app/api/animepahe/anime/${animeId}`,
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
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        `}</style>
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center transform rotate-6 shadow-2xl shadow-red-600/50">
            <TvIcon />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>
            NO ANIME SELECTED
          </h2>
          <p className="text-gray-400 mb-8" style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 400 }}>
            Select an anime to view detailed information
          </p>
          <button
            onClick={() => window.history.back()}
            className="group relative bg-red-600 text-white px-8 py-3 font-bold overflow-hidden"
            style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.1em', clipPath: 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)' }}
          >
            <span className="relative z-10">RETURN</span>
            <div className="absolute inset-0 bg-red-700 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        `}</style>
        <div className="flex flex-col items-center gap-6">
          <img 
            src="/loading.gif" 
            alt="Loading..." 
            className="w-64 h-64 object-contain"
            style={{ 
              mixBlendMode: 'screen',
              filter: 'contrast(1.2) brightness(1.1) hue-rotate(-10deg)'
            }}
          />
          <p className="text-red-500 text-xl font-bold animate-pulse" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.15em' }}>
            LOADING ANIME DATA
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        `}</style>
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-600/50">
            <span className="text-white text-5xl font-bold">!</span>
          </div>
          <h2 className="text-3xl font-bold text-red-500 mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>
            ERROR LOADING ANIME
          </h2>
          <p className="text-gray-400 mb-8" style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 400 }}>{error}</p>
          <button
            onClick={() => window.history.back()}
            className="group relative bg-red-600 text-white px-8 py-3 font-bold overflow-hidden"
            style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.1em', clipPath: 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)' }}
          >
            <span className="relative z-10">GO BACK</span>
            <div className="absolute inset-0 bg-red-700 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
          </button>
        </div>
      </div>
    );
  }

  if (!animeData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">No data available</div>
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
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        
        * {
          scrollbar-width: thin;
          scrollbar-color: #dc2626 #000000;
        }
        
        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        *::-webkit-scrollbar-track {
          background: #000000;
        }
        
        *::-webkit-scrollbar-thumb {
          background: #dc2626;
          border-radius: 4px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: #b91c1c;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-left {
          animation: slideInLeft 0.6s ease-out;
        }

        .animate-slide-right {
          animation: slideInRight 0.6s ease-out;
        }

        .animate-fade-up {
          animation: fadeInUp 0.6s ease-out;
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
      `}</style>

      {/* Hero Section - Cinematic Design */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={animeData.image}
            alt={title}
            className="md:hidden w-full h-full object-cover scale-105"
          />
          <img
            src={animeData.cover || animeData.image}
            alt={title}
            className="hidden md:block w-full h-full object-cover scale-105"
          />
          {/* Multiple gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>
          {/* Red accent gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-red-950/40 via-transparent to-transparent mix-blend-multiply"></div>
        </div>

        {/* Content Container */}
        <div className="relative h-full flex items-end pb-16 md:pb-20">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-12 gap-8 items-end">
              {/* Poster - Hidden on mobile */}
              <div className="hidden md:block md:col-span-3 animate-slide-left">
                <div className="relative group">
                  {/* Decorative corner accents */}
                  <div className="absolute -top-3 -left-3 w-16 h-16 border-t-4 border-l-4 border-red-600 z-10"></div>
                  <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-4 border-r-4 border-red-600 z-10"></div>
                  
                  <div className="relative overflow-hidden">
                    <img
                      src={animeData.image}
                      alt={title}
                      className="w-full aspect-[2/3] object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  
                  {/* Red line accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
                </div>
              </div>

              {/* Info Section */}
              <div className="md:col-span-9 space-y-6 animate-slide-right">
                {/* Title */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-1 w-12 bg-red-600"></div>
                    <span className="text-red-500 text-sm uppercase tracking-widest" style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>
                      Now Watching
                    </span>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    {title}
                  </h1>
                  
                  {nativeTitle && (
                    <p className="text-xl text-gray-400" style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 300 }}>
                      {nativeTitle}
                    </p>
                  )}
                </div>

                {/* Stats Bar */}
                <div className="flex flex-wrap items-center gap-3 animate-fade-up stagger-1">
                  {animeData.rating && (
                    <div className="flex items-center gap-2 bg-red-600 px-4 py-2" style={{ clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)' }}>
                      <StarIcon size={20} />
                      <span className="text-white text-xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                        {(animeData.rating / 10).toFixed(1)}
                      </span>
                    </div>
                  )}
                  
                  <div className="h-12 w-px bg-red-600/30"></div>
                  
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-lg font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{animeData.type}</span>
                  </div>
                  
                  <div className="h-12 w-px bg-red-600/30"></div>
                  
                  <div className="flex items-center gap-2 text-white">
                    <CalendarIcon />
                    <span className="text-lg font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{animeData.releaseDate}</span>
                  </div>
                  
                  {animeData.duration && (
                    <>
                      <div className="h-12 w-px bg-red-600/30"></div>
                      <div className="flex items-center gap-2 text-white">
                        <ClockIcon />
                        <span className="text-lg font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{animeData.duration}m</span>
                      </div>
                    </>
                  )}
                  
                  <div className="h-12 w-px bg-red-600/30"></div>
                  
                  <div className={`px-4 py-2 font-bold ${
                    animeData.status === 'Ongoing' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-800 text-gray-300'
                  }`} style={{ fontFamily: 'Bebas Neue, sans-serif', clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)' }}>
                    {animeData.status}
                  </div>
                </div>

                {/* Episode Count */}
                {animeData.totalEpisodes && (
                  <div className="inline-block animate-fade-up stagger-2">
                    <div className="relative bg-black border-2 border-red-600 px-6 py-3">
                      <div className="absolute top-0 left-0 w-3 h-3 bg-red-600"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-600"></div>
                      <span className="text-white text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.1em' }}>
                        {animeData.totalEpisodes} Episodes
                      </span>
                    </div>
                  </div>
                )}

                {/* Description Preview */}
                {animeData.description && (
                  <p className="text-gray-300 text-base max-w-3xl leading-relaxed line-clamp-3 animate-fade-up stagger-3" style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 400 }}>
                    {animeData.description.replace(/<[^>]*>/g, '')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

       
      </div>

      {/* Main Content Area */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          {/* Navigation Tabs */}
          <div className="mb-12">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide border-b border-red-600/20">
              {[
                { id: 'info' as const, label: 'OVERVIEW', show: true },
                { id: 'episodes' as const, label: 'EPISODES', show: true, count: episodes.length },
                { id: 'characters' as const, label: 'CHARACTERS', show: animeData.characters && animeData.characters.length > 0 },
                { id: 'recommendations' as const, label: 'SIMILAR', show: animeData.recommendations && animeData.recommendations.length > 0 },
                { id: 'relations' as const, label: 'RELATED', show: animeData.relations && animeData.relations.length > 0 },
              ].filter(tab => tab.show).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative px-6 py-3 font-bold text-lg whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                  style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.1em' }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="bg-red-600 text-white text-sm px-2 py-0.5 rounded">
                        {tab.count}
                      </span>
                    )}
                  </span>
                  
                  {activeTab === tab.id && (
                    <>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"></div>
                      <div className="absolute inset-0 bg-red-600/10"></div>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {/* Info Tab */}
            {activeTab === "info" && (
              <div className="space-y-16">
                {/* Synopsis */}
                <div className="animate-fade-up">
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-4xl font-bold text-white" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>
                      SYNOPSIS
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed" style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 400 }}>
                    {animeData.description?.replace(/<[^>]*>/g, '') || "No description available"}
                  </p>
                </div>

                {/* Trailer */}
                {animeData.trailer && animeData.trailer.id && (
                  <div className="animate-fade-up stagger-1">
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-4xl font-bold text-white" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>
                        TRAILER
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
                    </div>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 opacity-50 blur group-hover:opacity-75 transition-opacity"></div>
                      <div className="relative aspect-video overflow-hidden bg-black border-2 border-red-600">
                        <iframe
                          src={`https://www.youtube.com/embed/${animeData.trailer.id}`}
                          title="Anime Trailer"
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Genres */}
                {animeData.genres && animeData.genres.length > 0 && (
                  <div className="animate-fade-up stagger-2">
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-4xl font-bold text-white" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>
                        GENRES
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {animeData.genres.map((genre, idx) => (
                        <div
                          key={idx}
                          className="group relative bg-black border-2 border-red-600/50 px-6 py-3 hover:border-red-600 transition-all cursor-pointer"
                        >
                          <span className="text-red-500 font-bold text-lg group-hover:text-white transition-colors" style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>
                            {genre}
                          </span>
                          <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-colors"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Studios */}
                {animeData.studios && Array.isArray(animeData.studios) && animeData.studios.length > 0 && (
                  <div className="animate-fade-up stagger-3">
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-4xl font-bold text-white" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>
                        STUDIOS
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {animeData.studios.map((studio, idx) => (
                        <div
                          key={idx}
                          className="bg-red-600 px-6 py-3"
                          style={{ clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)' }}
                        >
                          <span className="text-white font-bold text-lg" style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>
                            {typeof studio === 'string' ? studio : studio.name || 'Unknown Studio'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Synonyms */}
                {animeData.synonyms && animeData.synonyms.length > 0 && (
                  <div className="animate-fade-up stagger-4">
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-4xl font-bold text-white" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>
                        ALTERNATIVE TITLES
                      </h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {animeData.synonyms.slice(0, 5).map((synonym, idx) => (
                        <div
                          key={idx}
                          className="bg-black border-2 border-red-600/30 px-5 py-2"
                        >
                          <span className="text-gray-300 font-semibold text-base" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {synonym}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Episodes Tab */}
            {activeTab === "episodes" && (
              <div className="space-y-8">
                {/* Search & Filter */}
                {episodes.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500">
                        <SearchIcon />
                      </div>
                      <input
                        type="text"
                        placeholder="SEARCH EPISODES..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-black border-2 border-red-600/50 text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors font-bold"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500">
                        <FilterIcon />
                      </div>
                      <select
                        value={episodeRange}
                        onChange={(e) => setEpisodeRange(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-black border-2 border-red-600/50 text-white focus:outline-none focus:border-red-600 cursor-pointer transition-colors font-bold appearance-none"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                      >
                        <option value="all">ALL EPISODES</option>
                        {(() => {
                          const ranges = [];
                          const totalEpisodes = episodes.length;
                          for (let i = 1; i <= totalEpisodes; i += 25) {
                            const end = Math.min(i + 24, totalEpisodes);
                            ranges.push(
                              <option key={`${i}-${end}`} value={`${i}-${end}`}>
                                EPISODES {i}-{end}
                              </option>
                            );
                          }
                          return ranges;
                        })()}
                      </select>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {episodesLoading && (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-white text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.1em' }}>
                      LOADING EPISODES
                    </p>
                  </div>
                )}

                {/* Error State */}
                {episodesError && (
                  <div className="text-center py-20">
                    <div className="text-red-500 text-7xl mb-6">⚠</div>
                    <p className="text-red-500 text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>{episodesError}</p>
                  </div>
                )}

                {/* No Episodes */}
                {!episodesLoading && !episodesError && episodes.length === 0 && (
                  <div className="text-center py-20">
                    <div className="text-gray-700 text-7xl mb-6">📺</div>
                    <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      NO EPISODES AVAILABLE
                    </h3>
                    <p className="text-gray-400 text-lg" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      Episodes will be available soon
                    </p>
                  </div>
                )}

                {/* No Search Results */}
                {!episodesLoading && episodes.length > 0 && filteredEpisodes.length === 0 && (
                  <div className="text-center py-20">
                    <div className="text-gray-700 text-7xl mb-6">🔍</div>
                    <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      NO MATCHES FOUND
                    </h3>
                    <p className="text-gray-400 text-lg" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      Try adjusting your filters
                    </p>
                  </div>
                )}

                {/* Episodes Grid */}
                {!episodesLoading && episodes.length > 0 && filteredEpisodes.length > 0 && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {displayedEpisodes.map((episode, idx) => (
                        <div
                          key={episode.episodeId}
                          onClick={() => {
                            window.location.href = `/Watch/animepahe2/${episode.episodeId}?animeId=${animeId}`;
                          }}
                          className="group relative bg-black border-2 border-red-600/20 overflow-hidden hover:border-red-600 transition-all cursor-pointer animate-fade-up"
                          style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                          {episode.thumbnail ? (
                            <div className="relative aspect-video overflow-hidden">
                              <img
                                src={getWeservImage(episode.thumbnail, 400)}
                                alt={episode.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-red-600 rounded-full p-4 transform group-hover:scale-110 transition-transform">
                                  <PlayIcon />
                                </div>
                              </div>
                              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-1" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                                EP {episode.episodeNumber}
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-video bg-gradient-to-br from-red-950 to-black flex items-center justify-center">
                              <div className="text-center">
                                <div className="bg-red-600 rounded-full p-4 mx-auto mb-2">
                                  <PlayIcon />
                                </div>
                                <span className="text-white text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                                  {episode.episodeNumber}
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="p-3 bg-black">
                            <h4 className="text-white font-bold text-sm line-clamp-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                              {episode.title || `Episode ${episode.episodeNumber}`}
                            </h4>
                            {episode.airDate && (
                              <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                {new Date(episode.airDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Show More Button */}
                    {filteredEpisodes.length > 12 && (
                      <div className="flex justify-center mt-10">
                        <button
                          onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                          className="group relative bg-red-600 text-white px-10 py-4 font-bold text-xl overflow-hidden flex items-center gap-3"
                          style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.1em' }}
                        >
                          <span className="relative z-10">
                            {showAllEpisodes ? 'SHOW LESS' : `SHOW ALL ${filteredEpisodes.length} EPISODES`}
                          </span>
                          <ArrowIcon />
                          <div className="absolute inset-0 bg-red-700 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Characters Tab */}
            {activeTab === "characters" && animeData.characters && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-4xl font-bold text-white" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>
                    CHARACTERS & VOICE ACTORS
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {animeData.characters.slice(0, 20).map((character, idx) => (
                    <div
                      key={character.id}
                      className="group relative bg-black border-2 border-red-600/20 overflow-hidden hover:border-red-600 transition-all animate-fade-up"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="flex gap-4 p-4">
                        <div className="flex-shrink-0 relative">
                          <div className="w-20 h-28 md:w-24 md:h-32 overflow-hidden">
                            <img
                              src={getWeservImage(character.image, 200)}
                              alt={character.name.full || character.name.userPreferred}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-bold text-lg mb-1 line-clamp-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {character.name.full || character.name.userPreferred}
                          </h4>
                          <p className="text-red-500 text-sm uppercase font-bold mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {character.role}
                          </p>
                          {character.voiceActors && character.voiceActors.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-red-600/20">
                              {character.voiceActors.slice(0, 1).map((va) => (
                                <div key={va.id} className="flex items-center gap-3">
                                  <div className="w-10 h-10 overflow-hidden rounded-full flex-shrink-0 border-2 border-red-600/30">
                                    <img
                                      src={getWeservImage(va.image, 100)}
                                      alt={va.name.full}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-gray-300 text-sm line-clamp-1 font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                      {va.name.full}
                                    </p>
                                    <p className="text-gray-600 text-xs uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                      {va.language}
                                    </p>
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

            {/* Recommendations Tab */}
            {activeTab === "recommendations" && animeData.recommendations && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-4xl font-bold text-white" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>
                    YOU MIGHT ALSO LIKE
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {animeData.recommendations.slice(0, 15).map((rec, idx) => {
                    const recTitle = rec.title.english || rec.title.romaji || rec.title.userPreferred || "Unknown Title";
                    return (
                      <div
                        key={rec.id}
                        onClick={() => window.location.href = `/details/${rec.id}`}
                        className="group relative bg-black border-2 border-red-600/20 overflow-hidden hover:border-red-600 transition-all cursor-pointer animate-fade-up"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <div className="relative aspect-[2/3] overflow-hidden">
                          <img
                            src={getWeservImage(rec.image, 400)}
                            alt={recTitle}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                          {rec.rating && (
                            <div className="absolute top-3 right-3 bg-red-600 text-white text-sm font-bold px-3 py-1 flex items-center gap-1" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                              <StarIcon size={14} />
                              {(rec.rating / 10).toFixed(1)}
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-black">
                          <h4 className="text-white font-bold text-sm line-clamp-2 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {recTitle}
                          </h4>
                          <p className="text-gray-500 text-xs" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {rec.type} • {rec.episodes || '?'} EPS
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Relations Tab */}
            {activeTab === "relations" && animeData.relations && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-4xl font-bold text-white" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>
                    RELATED ANIME
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {animeData.relations
                    .filter((relation) => relation.type !== "MANGA" && relation.type !== "NOVEL" && relation.type !== "MUSIC")
                    .map((relation, idx) => {
                      const relTitle = relation.title.english || relation.title.romaji || relation.title.userPreferred || "Unknown Title";
                      return (
                        <div
                          key={relation.id}
                          onClick={() => window.location.href = `/details/${relation.id}`}
                          className="group relative bg-black border-2 border-red-600/20 overflow-hidden hover:border-red-600 transition-all cursor-pointer animate-fade-up"
                          style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                          <div className="relative aspect-[2/3] overflow-hidden">
                            <img
                              src={getWeservImage(relation.image, 400)}
                              alt={relTitle}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                            <div className="absolute top-3 left-3 bg-black/80 border border-red-600 text-red-500 text-xs font-bold px-2 py-1 uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                              {relation.relationType.replace(/_/g, ' ')}
                            </div>
                            {relation.rating && (
                              <div className="absolute top-3 right-3 bg-red-600 text-white text-sm font-bold px-3 py-1 flex items-center gap-1" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                                <StarIcon size={14} />
                                {(relation.rating / 10).toFixed(1)}
                              </div>
                            )}
                          </div>
                          <div className="p-3 bg-black">
                            <h4 className="text-white font-bold text-sm line-clamp-2 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                              {relTitle}
                            </h4>
                            <p className="text-gray-500 text-xs" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                              {relation.type} {relation.episodes && `• ${relation.episodes} EPS`}
                            </p>
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

      {/* Footer Spacing */}
      <div className="h-20 bg-black"></div>
    </div>
  );
}

export default AnimeDetailsPage;