"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import type { AnimeDetails, Episode, Recommendation, Character, Relation } from "@/app/types/anime";

interface Anime123Episode {
  episode: number;
  label: string;
  slug: string;
  episodeId: string;
  url: string;
  m3u8?: string;
  isFirst?: boolean;
  isLast?: boolean;
  title?: string;
  overview?: string;
  airDate?: string;
  aired?: boolean;
  rating?: string;
  thumbnail?: string;
  seasonNumber?: number;
  episodeNumber?: number;
}

interface Anime123Response {
  data: {
    slug: string;
    title: string;
    cover: string;
    synopsis: string;
    genres: string[];
    info: {
      Type: string;
      Genre: string;
      Country: string;
      Status: string;
      Released: string;
    };
    episodes: Anime123Episode[];
  };
}

interface AnilistEpisode {
  episode: number;
  absoluteEpisode: number;
  title: string;
  overview?: string;
  airDate?: string;
  aired?: boolean;
  rating?: string;
  thumbnail?: string;
  seasonNumber?: number;
  episodeNumber?: number;
}

// Raw AniList GraphQL shape returned by maaa-six
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawAnilist = Record<string, any>;

// maaa-six API response
interface MaaaSixResponse {
  success?: boolean;
  anilist?: RawAnilist;
  animeInfo?: RawAnilist;
  info?: RawAnilist;
  data?: RawAnilist;
  episodes?: {
    total: number;
    merged: AnilistEpisode[];
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface AnimeDaoEpisode {
  id?: string;
  episodeId?: string;
  episode: number;
  title?: string;
  fullTitle?: string;
  date?: string;
  watchUrl?: string;
  streamUrl?: string;
  tmdbTitle?: string;
  overview?: string;
  airDate?: string;
  aired?: boolean;
  tmdbRating?: string;
  thumbnail?: string;
  seasonNumber?: number;
  episodeNumber?: number;
}

interface AnimeDaoResponse {
  episodes?: AnimeDaoEpisode[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/** Upgrade AniList CDN image URLs from medium/small to large */
const anilistLarge = (url?: string): string => {
  if (!url) return "";
  return url
    .replace("/cover/small/", "/cover/large/")
    .replace("/cover/medium/", "/cover/large/")
    .replace("/character/medium/", "/character/large/")
    .replace("/staff/medium/", "/staff/large/");
};

/** Convert raw AniList GraphQL response → AnimeDetails shape the component uses */
const normalizeAnilist = (raw: RawAnilist): AnimeDetails => {
  const characters: Character[] = (raw.characters?.edges ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (edge: any) => ({
      id: edge.node?.id ?? 0,
      name: {
        full: edge.node?.name?.full ?? edge.node?.name?.userPreferred ?? "",
        userPreferred: edge.node?.name?.userPreferred ?? edge.node?.name?.full ?? "",
      },
      image: anilistLarge(edge.node?.image?.large ?? edge.node?.image?.medium),
      role: edge.role ?? "SUPPORTING",
      voiceActors: (edge.voiceActors ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (va: any) => ({
          id: va.id ?? 0,
          name: { full: va.name?.full ?? "" },
          image: anilistLarge(va.image?.large ?? va.image?.medium),
          language: va.languageV2 ?? va.language ?? "",
        })
      ),
    })
  );

  const relations: Relation[] = (raw.relations?.edges ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (edge: any) => ({
      id: edge.node?.id ?? 0,
      title: {
        romaji: edge.node?.title?.romaji ?? "",
        english: edge.node?.title?.english ?? null,
        userPreferred: edge.node?.title?.userPreferred ?? edge.node?.title?.romaji ?? "",
        native: edge.node?.title?.native ?? null,
      },
      image: anilistLarge(edge.node?.coverImage?.large ?? edge.node?.coverImage?.medium),
      type: edge.node?.type ?? edge.node?.format ?? "",
      relationType: edge.relationType ?? "",
      status: edge.node?.status ?? "",
      rating: edge.node?.averageScore ?? null,
      episodes: edge.node?.episodes ?? null,
    })
  );

  const recommendations: Recommendation[] = (raw.recommendations?.nodes ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((n: any) => n?.mediaRecommendation)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((n: any) => {
      const m = n.mediaRecommendation;
      return {
        id: m.id ?? 0,
        title: {
          romaji: m.title?.romaji ?? "",
          english: m.title?.english ?? null,
          userPreferred: m.title?.userPreferred ?? m.title?.romaji ?? "",
          native: m.title?.native ?? null,
        },
        image: anilistLarge(m.coverImage?.large ?? m.coverImage?.medium),
        type: m.format ?? m.type ?? "",
        rating: m.averageScore ?? null,
        episodes: m.episodes ?? null,
      };
    });

  return {
    id: raw.id,
    title: {
      romaji: raw.title?.romaji ?? "",
      english: raw.title?.english ?? null,
      native: raw.title?.native ?? null,
      userPreferred: raw.title?.userPreferred ?? raw.title?.romaji ?? "",
    },
    image: anilistLarge(raw.coverImage?.large ?? raw.coverImage?.medium ?? raw.image),
    cover: raw.bannerImage ?? raw.cover ?? null,
    description: raw.description ?? "",
    status: raw.status ?? "",
    type: raw.format ?? raw.type ?? "",
    rating: raw.averageScore ?? raw.rating ?? null,
    releaseDate: raw.startDate?.year ?? raw.releaseDate ?? null,
    totalEpisodes: raw.episodes ?? raw.totalEpisodes ?? null,
    duration: raw.duration ?? null,
    genres: raw.genres ?? [],
    studios: (raw.studios?.nodes ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((s: any) => s?.name ?? s)
      .filter(Boolean),
    trailer: raw.trailer?.id
      ? { id: raw.trailer.id, site: raw.trailer.site ?? "youtube" }
      : undefined,
    characters,
    relations,
    recommendations,
  } as AnimeDetails;
};

// AllAnime API response
interface AllAnimeEpisode {
  episodeId: string;
  episode: string;
  type: string;
  label: string;
  title?: string;
  overview?: string;
  airDate?: string;
  aired?: boolean;
  rating?: string;
  thumbnail?: string;
  seasonNumber?: number;
  episodeNumber?: number;
}

interface AllAnimeResponse {
  anilistId: number;
  provider: string;
  animeId: string;
  name: string;
  total: number;
  episodes: AllAnimeEpisode[];
}

const getAnimeIdFromUrl = (): string => {
  if (typeof window === "undefined") return "";
  const hash = window.location.hash.replace("#", "");
  const pathParts = window.location.pathname.split("/");
  const id = hash || pathParts[pathParts.length - 1] || "";
  return id !== "details" ? id : "";
};

/** Remove duplicate episodes by episodeId, keeping the first occurrence */
const dedupeEpisodes = (eps: Episode[]): Episode[] => {
  const seen = new Set<string>();
  return eps.filter((ep) => {
    if (seen.has(ep.episodeId)) return false;
    seen.add(ep.episodeId);
    return true;
  });
};

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
  if (!imageUrl) return "";
  try {
    let cleanUrl = imageUrl.trim();
    if (
      (cleanUrl.startsWith("'") && cleanUrl.endsWith("'")) ||
      (cleanUrl.startsWith('"') && cleanUrl.endsWith('"'))
    ) {
      cleanUrl = cleanUrl.slice(1, -1);
    }
    if (cleanUrl.includes("seiryuu.vid-cdn.xyz") || cleanUrl.includes("anizone")) {
      return cleanUrl;
    }
    const encodedUrl = encodeURIComponent(cleanUrl);
    let url = `https://animepahe-pi.vercel.app/api/proxy/image?url=${encodedUrl}`;
    if (width) url += `&w=${width}&fit=cover`;
    return url;
  } catch {
    return imageUrl;
  }
};

/** Human-readable label for a provider key */
const providerLabel = (p: string): string => {
  switch (p) {
    case "123anime":  return "123ANIME";
    case "anilist":   return "ANILIST";
    case "allanime":  return "ALLANIME";
    case "animedao":  return "ANIMEDAO";
    default:          return p.toUpperCase();
  }
};

function AnimeDetailsPage() {
  const [animeId, setAnimeId] = useState<string>("");

  useEffect(() => {
    setAnimeId(getAnimeIdFromUrl());
  }, []);

  const [animeData, setAnimeData] = useState<AnimeDetails | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [episodesError, setEpisodesError] = useState<string | null>(null);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("anilist");
  const [activeTab, setActiveTab] = useState<"characters" | "recommendations" | "relations" | "info" | "episodes">("episodes");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [episodeRange, setEpisodeRange] = useState<string>("all");

  // anilist is always first — it is the main provider
  const providers = ["anilist", "animepahe", "hianime", "anizone", "123anime", "animedao", "allanime"];

  // ── Update meta tags ──
  useEffect(() => {
    if (!animeData) return;
    const title =
      animeData.title?.english ||
      animeData.title?.romaji ||
      animeData.title?.userPreferred ||
      "Anime Details";
    document.title = `${title} - Anime Details`;

    const description =
      animeData.description?.replace(/<[^>]*>/g, "").substring(0, 160) ||
      "Watch anime online";

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", animeData.image);
    setMeta("property", "og:type", "video.tv_show");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", animeData.image);

    return () => { document.title = "Anime Details"; };
  }, [animeData]);

  // ── Fetch anime details ──
  useEffect(() => {
    if (!animeId) return;
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
      const mainRes = await axios.get<MaaaSixResponse>(
  `/maaa/api/anime/${animeId}`
);

        if (!cancelled) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const raw = mainRes.data as Record<string, any>;
          console.log("[maaa-six] raw response:", raw);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const findRaw = (): Record<string, any> | null => {
            for (const key of ["anilist", "animeInfo", "info", "data", "anime", "media"]) {
              if (raw[key]?.title) return raw[key];
            }
            if (raw?.title) return raw;
            for (const val of Object.values(raw)) {
              if (val && typeof val === "object" && !Array.isArray(val) && (val as RawAnilist).title)
                return val as RawAnilist;
            }
            return null;
          };

          const rawAnime = findRaw();
          if (rawAnime) {
            setAnimeData(normalizeAnilist(rawAnime));
          } else {
            console.error("[maaa-six] unrecognized response shape:", raw);
            setError("No anime data returned from the server.");
          }
        }
      } catch (err) {
        if (!cancelled)
          setError(
            axios.isAxiosError(err)
              ? err.response?.data?.message || err.message
              : "Failed to load anime details"
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [animeId]);

  // ── Fetch episodes ──
  useEffect(() => {
    if (!animeId) return;

    let cancelled = false;

    async function run() {
      setEpisodesLoading(true);
      setEpisodesError(null);
      setEpisodes([]);

      try {
        if (selectedProvider === "123anime") {
          const res = await axios.get(
            `/api/anime/123anime/details/${animeId}?apiKey=fuckyoubitch`
          );
          if (!cancelled) {
            const data = res.data as Anime123Response;
            if (Array.isArray(data?.data?.episodes)) {
              const mapped: Episode[] = data.data.episodes
                .map((ep) => ({
                  episodeNumber: ep.episodeNumber ?? ep.episode ?? 0,
                  episodeId: ep.episodeId,
                  title: ep.title || ep.label || `Episode ${ep.episode}`,
                  thumbnail: ep.thumbnail || undefined,
                  airDate: ep.airDate || undefined,
                }))
                .sort((a, b) => a.episodeNumber - b.episodeNumber);
              setEpisodes(dedupeEpisodes(mapped));
            } else {
              setEpisodes([]);
            }
          }
        } else if (selectedProvider === "anilist") {
          // ── MAIN provider: maaa-six ──
          const res = await axios.get<MaaaSixResponse>(
  `/maaa/api/anime/${animeId}`
);
          if (!cancelled) {
            const merged = res.data?.episodes?.merged;
            if (Array.isArray(merged)) {
              const mapped: Episode[] = merged
                .map((ep) => ({
                  episodeNumber: ep.episode ?? ep.absoluteEpisode ?? 0,
                  episodeId: String(ep.episode),
                  title: ep.title || `Episode ${ep.episode}`,
                  thumbnail: ep.thumbnail || undefined,
                  airDate: ep.airDate || undefined,
                }))
                .sort((a, b) => a.episodeNumber - b.episodeNumber);
              setEpisodes(dedupeEpisodes(mapped));
            } else {
              setEpisodes([]);
            }
          }
        } else if (selectedProvider === "animedao") {
          // ── AnimDao provider ──
          const res = await axios.get<AnimeDaoResponse>(
            `/api/anime/animedao/details/${animeId}?apiKey=fuckyoubitch`
          );
          if (!cancelled) {
            const epList = res.data?.episodes;
            if (Array.isArray(epList)) {
              const mapped: Episode[] = epList
                .map((ep) => ({
                  episodeNumber: ep.episodeNumber ?? ep.episode ?? 0,
                  episodeId: ep.episodeId ?? ep.id ?? String(ep.episode),
                  title: ep.title || `Episode ${ep.episode}`,
                  thumbnail: ep.thumbnail || undefined,
                  airDate: ep.airDate || undefined,
                }))
                .sort((a, b) => a.episodeNumber - b.episodeNumber);
              setEpisodes(dedupeEpisodes(mapped));
            } else {
              setEpisodes([]);
            }
          }
        } else if (selectedProvider === "allanime") {
          // ── AllAnime provider ──
          const res = await axios.get<AllAnimeResponse>(
            `/api/animeanimeyubi/anilist/${animeId}`,
            { params: { provider: "allanime", apiKey: "fuckyoubitch" } }
          );
          if (!cancelled) {
            const epList = res.data?.episodes;
            if (Array.isArray(epList)) {
              const mapped: Episode[] = epList
                .map((ep) => ({
                  episodeNumber: ep.episodeNumber ?? parseInt(ep.episode) ?? 0,
                  episodeId: ep.episodeId,
                  title: ep.title || ep.label || `Episode ${ep.episode}`,
                  thumbnail: ep.thumbnail || undefined,
                  airDate: ep.airDate || undefined,
                }))
                .sort((a, b) => a.episodeNumber - b.episodeNumber);
              setEpisodes(dedupeEpisodes(mapped));
            } else {
              setEpisodes([]);
            }
          }
        } else {
          const res = await axios.get(
            `https://dog-five-psi.vercel.app/api/anilist/episodes/${animeId}`,
            { params: { provider: selectedProvider } }
          );
          if (!cancelled) {
            const data = res.data?.providerEpisodes;
            setEpisodes(dedupeEpisodes(Array.isArray(data) ? data : []));
          }
        }
      } catch (err) {
        if (!cancelled)
          setEpisodesError(
            axios.isAxiosError(err)
              ? err.response?.data?.message || err.message
              : "Failed to load episodes"
          );
      } finally {
        if (!cancelled) setEpisodesLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [animeId, selectedProvider]);

  /* ── Early returns ── */
  if (!animeId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');`}</style>
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center transform rotate-6 shadow-2xl shadow-red-600/50">
            <TvIcon />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.05em" }}>
            NO ANIME SELECTED
          </h2>
          <p className="text-gray-400 mb-8" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 400 }}>
            Select an anime to view detailed information
          </p>
          <button
            onClick={() => window.history.back()}
            className="group relative bg-red-600 text-white px-8 py-3 font-bold overflow-hidden"
            style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em", clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0 100%)" }}
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
        <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');`}</style>
        <div className="flex flex-col items-center gap-6">
          <img
            src="/loading.gif"
            alt="Loading..."
            className="w-64 h-64 object-contain"
            style={{ mixBlendMode: "screen", filter: "contrast(1.2) brightness(1.1) hue-rotate(-10deg)" }}
          />
          <p className="text-red-500 text-xl font-bold animate-pulse" style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.15em" }}>
            LOADING ANIME DATA
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');`}</style>
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-600/50">
            <span className="text-white text-5xl font-bold">!</span>
          </div>
          <h2 className="text-3xl font-bold text-red-500 mb-3" style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.05em" }}>
            ERROR LOADING ANIME
          </h2>
          <p className="text-gray-400 mb-8" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 400 }}>{error}</p>
          <button
            onClick={() => window.history.back()}
            className="group relative bg-red-600 text-white px-8 py-3 font-bold overflow-hidden"
            style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em", clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0 100%)" }}
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

  const title =
    animeData.title.english ||
    animeData.title.romaji ||
    animeData.title.userPreferred ||
    "Unknown Title";

  const filteredEpisodes = episodes.filter((episode) => {
    const matchesSearch =
      searchQuery === "" ||
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

        * { scrollbar-width: thin; scrollbar-color: #dc2626 #000000; }
        *::-webkit-scrollbar { width: 8px; height: 8px; }
        *::-webkit-scrollbar-track { background: #000000; }
        *::-webkit-scrollbar-thumb { background: #dc2626; border-radius: 4px; }
        *::-webkit-scrollbar-thumb:hover { background: #b91c1c; }

        @keyframes slideInLeft  { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInRight { from { opacity:0; transform:translateX( 30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeInUp     { from { opacity:0; transform:translateY( 20px); } to { opacity:1; transform:translateY(0); } }

        .animate-slide-left  { animation: slideInLeft  0.6s ease-out; }
        .animate-slide-right { animation: slideInRight 0.6s ease-out; }
        .animate-fade-up     { animation: fadeInUp     0.6s ease-out; }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
      `}</style>

      {/* ── Hero ── */}
      <div className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img src={animeData.image} alt={title} className="md:hidden w-full h-full object-cover scale-105" />
          <img src={animeData.cover || animeData.image} alt={title} className="hidden md:block w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-red-950/40 via-transparent to-transparent mix-blend-multiply"></div>
        </div>

        <div className="relative h-full flex items-end pb-16 md:pb-20">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-12 gap-8 items-end">

              {/* Poster */}
              <div className="hidden md:block md:col-span-3 animate-slide-left">
                <div className="relative group">
                  <div className="absolute -top-3 -left-3 w-16 h-16 border-t-4 border-l-4 border-red-600 z-10"></div>
                  <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-4 border-r-4 border-red-600 z-10"></div>
                  <div className="relative overflow-hidden">
                    <img src={animeData.image} alt={title} className="w-full aspect-[2/3] object-cover transform group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
                </div>
              </div>

              {/* Info */}
              <div className="md:col-span-9 space-y-6 animate-slide-right">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-1 w-12 bg-red-600"></div>
                    <span className="text-red-500 text-sm uppercase tracking-widest" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700 }}>Now Watching</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                    {title}
                  </h1>
                  {animeData.title.native && (
                    <p className="text-xl text-gray-400" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 300 }}>{animeData.title.native}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 animate-fade-up stagger-1">
                  {animeData.rating && (
                    <div className="flex items-center gap-2 bg-red-600 px-4 py-2" style={{ clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0 100%)" }}>
                      <StarIcon size={20} />
                      <span className="text-white text-xl font-bold" style={{ fontFamily: "Bebas Neue, sans-serif" }}>{(animeData.rating / 10).toFixed(1)}</span>
                    </div>
                  )}
                  <div className="h-12 w-px bg-red-600/30"></div>
                  <span className="text-white text-lg font-bold" style={{ fontFamily: "Rajdhani, sans-serif" }}>{animeData.type}</span>
                  <div className="h-12 w-px bg-red-600/30"></div>
                  <div className="flex items-center gap-2 text-white">
                    <CalendarIcon />
                    <span className="text-lg font-bold" style={{ fontFamily: "Rajdhani, sans-serif" }}>{animeData.releaseDate}</span>
                  </div>
                  {animeData.duration && (
                    <>
                      <div className="h-12 w-px bg-red-600/30"></div>
                      <div className="flex items-center gap-2 text-white">
                        <ClockIcon />
                        <span className="text-lg font-bold" style={{ fontFamily: "Rajdhani, sans-serif" }}>{animeData.duration}m</span>
                      </div>
                    </>
                  )}
                  <div className="h-12 w-px bg-red-600/30"></div>
                  <div
                    className={`px-4 py-2 font-bold ${animeData.status === "Ongoing" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300"}`}
                    style={{ fontFamily: "Bebas Neue, sans-serif", clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0 100%)" }}
                  >
                    {animeData.status}
                  </div>
                </div>

                {animeData.totalEpisodes && (
                  <div className="inline-block animate-fade-up stagger-2">
                    <div className="relative bg-black border-2 border-red-600 px-6 py-3">
                      <div className="absolute top-0 left-0 w-3 h-3 bg-red-600"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-600"></div>
                      <span className="text-white text-2xl font-bold" style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}>
                        {animeData.totalEpisodes} Episodes
                      </span>
                    </div>
                  </div>
                )}

                {animeData.description && (
                  <p className="text-gray-300 text-base max-w-3xl leading-relaxed line-clamp-3 animate-fade-up stagger-3" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 400 }}>
                    {animeData.description.replace(/<[^>]*>/g, "")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">

          {/* Tabs */}
          <div className="mb-12">
            <div className="flex gap-4 overflow-x-auto pb-4 border-b border-red-600/20">
              {[
                { id: "episodes" as const,       label: "EPISODES",   show: true, count: episodes.length },
                { id: "info" as const,            label: "OVERVIEW",   show: true },
                { id: "characters" as const,      label: "CHARACTERS", show: !!(animeData.characters?.length) },
                { id: "recommendations" as const, label: "SIMILAR",    show: !!(animeData.recommendations?.length) },
                { id: "relations" as const,       label: "RELATED",    show: !!(animeData.relations?.length) },
              ].filter((t) => t.show).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative px-6 py-3 font-bold text-lg whitespace-nowrap transition-all ${
                    activeTab === tab.id ? "text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                  style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="bg-red-600 text-white text-sm px-2 py-0.5 rounded">{tab.count}</span>
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

          <div className="min-h-[600px]">

            {/* ── Episodes ── */}
            {activeTab === "episodes" && (
              <div className="space-y-8">

                <div className="w-full md:w-auto">
                  <label className="block text-red-500 text-sm uppercase tracking-wider mb-3 font-bold" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                    Provider
                  </label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="w-full md:w-64 bg-black text-white border-2 border-red-600 px-4 py-3 font-bold text-lg focus:outline-none focus:border-red-500 cursor-pointer transition-colors"
                    style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.05em" }}
                  >
                    {providers.map((p) => (
                      <option key={p} value={p}>{providerLabel(p)}</option>
                    ))}
                  </select>
                </div>

                {episodes.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"><SearchIcon /></div>
                      <input
                        type="text"
                        placeholder="SEARCH EPISODES..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-black border-2 border-red-600/50 text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-colors font-bold"
                        style={{ fontFamily: "Rajdhani, sans-serif" }}
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"><FilterIcon /></div>
                      <select
                        value={episodeRange}
                        onChange={(e) => setEpisodeRange(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-black border-2 border-red-600/50 text-white focus:outline-none focus:border-red-600 cursor-pointer transition-colors font-bold appearance-none"
                        style={{ fontFamily: "Rajdhani, sans-serif" }}
                      >
                        <option value="all">ALL EPISODES</option>
                        {Array.from({ length: Math.ceil(episodes.length / 25) }, (_, i) => {
                          const start = i * 25 + 1;
                          const end = Math.min(start + 24, episodes.length);
                          return (
                            <option key={`${start}-${end}`} value={`${start}-${end}`}>
                              EPISODES {start}–{end}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                )}

                {episodesLoading && (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-white text-2xl font-bold" style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}>LOADING EPISODES</p>
                  </div>
                )}

                {episodesError && (
                  <div className="text-center py-20">
                    <div className="text-red-500 text-7xl mb-6">⚠</div>
                    <p className="text-red-500 text-2xl font-bold" style={{ fontFamily: "Bebas Neue, sans-serif" }}>{episodesError}</p>
                  </div>
                )}

                {!episodesLoading && !episodesError && episodes.length === 0 && (
                  <div className="text-center py-20">
                    <div className="text-gray-700 text-7xl mb-6">📺</div>
                    <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                      NO EPISODES FOR {providerLabel(selectedProvider)}
                    </h3>
                    <p className="text-gray-400 text-lg mb-8" style={{ fontFamily: "Rajdhani, sans-serif" }}>Try selecting a different provider</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                      {providers.filter((p) => p !== selectedProvider).map((p) => (
                        <button
                          key={p}
                          onClick={() => setSelectedProvider(p)}
                          className="group relative bg-red-600 text-white px-8 py-3 font-bold overflow-hidden"
                          style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}
                        >
                          <span className="relative z-10">TRY {providerLabel(p)}</span>
                          <div className="absolute inset-0 bg-red-700 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!episodesLoading && episodes.length > 0 && filteredEpisodes.length === 0 && (
                  <div className="text-center py-20">
                    <div className="text-gray-700 text-7xl mb-6">🔍</div>
                    <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "Bebas Neue, sans-serif" }}>NO MATCHES FOUND</h3>
                    <p className="text-gray-400 text-lg" style={{ fontFamily: "Rajdhani, sans-serif" }}>Try adjusting your filters</p>
                  </div>
                )}

                {!episodesLoading && filteredEpisodes.length > 0 && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {displayedEpisodes.map((episode, idx) => (
                        <div
                          key={`${episode.episodeId}-${episode.episodeNumber}`}
                          onClick={() => {
                            if (selectedProvider === "animepahe") {
                              window.location.href = `/Watch/animepahe/${encodeURIComponent(episode.episodeId)}?animeId=${animeId}`;
                            } else if (selectedProvider === "hianime") {
                              window.location.href = `/Watch/hianime/${encodeURIComponent(episode.episodeId)}?animeId=${animeId}`;
                            } else if (selectedProvider === "anizone") {
                              window.location.href = `/Watch/anizone/${encodeURIComponent(episode.episodeId)}?animeId=${animeId}`;
                            } else if (selectedProvider === "123anime") {
                              window.location.href = `/Watch/123anime/${encodeURIComponent(episode.episodeId)}`;
                            } else if (selectedProvider === "anilist") {
                              window.location.href = `/Watch/anilist/${encodeURIComponent(episode.episodeId)}/${animeId}`;
                            } else if (selectedProvider === "animedao") {
                              window.location.href = `/Watch/animedao/${encodeURIComponent(episode.episodeId)}?animeId=${animeId}`;
                            } else if (selectedProvider === "allanime") {
                              window.location.href = `/Watch/allanime/${encodeURIComponent(episode.episodeId)}?animeId=${animeId}`;
                            } else {
                              window.location.href = `/Watch/Player/episodeId=${encodeURIComponent(episode.episodeId)}&provider=${selectedProvider}&animeId=${animeId}`;
                            }
                          }}
                          className="group relative bg-black border-2 border-red-600/20 overflow-hidden hover:border-red-600 transition-all cursor-pointer animate-fade-up"
                          style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                          {episode.thumbnail ? (
                            <div className="relative aspect-video overflow-hidden">
                              <img
                                src={episode.thumbnail}
                                alt={episode.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-red-600 rounded-full p-4 transform group-hover:scale-110 transition-transform">
                                  <PlayIcon />
                                </div>
                              </div>
                              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-1" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                                EP {episode.episodeNumber}
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-video bg-gradient-to-br from-red-950 to-black flex items-center justify-center">
                              <div className="text-center">
                                <div className="bg-red-600 rounded-full p-4 mx-auto mb-2"><PlayIcon /></div>
                                <span className="text-white text-2xl font-bold" style={{ fontFamily: "Bebas Neue, sans-serif" }}>{episode.episodeNumber}</span>
                              </div>
                            </div>
                          )}
                          <div className="p-3 bg-black">
                            <h4 className="text-white font-bold text-sm line-clamp-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>{episode.title}</h4>
                            {episode.airDate && (
                              <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                                {new Date(episode.airDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredEpisodes.length > 12 && (
                      <div className="flex justify-center mt-10">
                        <button
                          onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                          className="group relative bg-red-600 text-white px-10 py-4 font-bold text-xl overflow-hidden flex items-center gap-3"
                          style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.1em" }}
                        >
                          <span className="relative z-10">
                            {showAllEpisodes ? "SHOW LESS" : `SHOW ALL ${filteredEpisodes.length} EPISODES`}
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

            {/* ── Overview ── */}
            {activeTab === "info" && (
              <div className="space-y-16">
                <div className="animate-fade-up">
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.05em" }}>SYNOPSIS</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 400 }}>
                    {animeData.description?.replace(/<[^>]*>/g, "") || "No description available"}
                  </p>
                </div>

                {animeData.trailer?.id && (
                  <div className="animate-fade-up stagger-1">
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.05em" }}>TRAILER</h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
                    </div>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 opacity-50 blur group-hover:opacity-75 transition-opacity"></div>
                      <div className="relative aspect-video overflow-hidden bg-black border-2 border-red-600">
                        <iframe src={`https://www.youtube.com/embed/${animeData.trailer.id}`} title="Anime Trailer" className="w-full h-full" allowFullScreen />
                      </div>
                    </div>
                  </div>
                )}

                {animeData.genres && animeData.genres.length > 0 && (
                  <div className="animate-fade-up stagger-2">
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.05em" }}>GENRES</h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {animeData.genres.map((genre, idx) => (
                        <div key={idx} className="group relative bg-black border-2 border-red-600/50 px-6 py-3 hover:border-red-600 transition-all cursor-pointer">
                          <span className="text-red-500 font-bold text-lg group-hover:text-white transition-colors" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700 }}>{genre}</span>
                          <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-colors"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {animeData.studios && animeData.studios.length > 0 && (
                  <div className="animate-fade-up stagger-3">
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.05em" }}>STUDIOS</h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {animeData.studios.map((studio, idx) => (
                        <div key={idx} className="bg-red-600 px-6 py-3" style={{ clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0 100%)" }}>
                          <span className="text-white font-bold text-lg" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700 }}>{studio}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Characters ── */}
            {activeTab === "characters" && animeData.characters && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.05em" }}>CHARACTERS & VOICE ACTORS</h2>
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
                            <img src={getWeservImage(character.image, 200)} alt={character.name.full || character.name.userPreferred} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-bold text-lg mb-1 line-clamp-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>{character.name.full || character.name.userPreferred}</h4>
                          <p className="text-red-500 text-sm uppercase font-bold mb-3" style={{ fontFamily: "Rajdhani, sans-serif" }}>{character.role}</p>
                          {character.voiceActors && character.voiceActors.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-red-600/20">
                              {character.voiceActors.slice(0, 1).map((va) => (
                                <div key={va.id} className="flex items-center gap-3">
                                  <div className="w-10 h-10 overflow-hidden rounded-full flex-shrink-0 border-2 border-red-600/30">
                                    <img src={getWeservImage(va.image, 100)} alt={va.name.full} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-gray-300 text-sm line-clamp-1 font-semibold" style={{ fontFamily: "Rajdhani, sans-serif" }}>{va.name.full}</p>
                                    <p className="text-gray-600 text-xs uppercase" style={{ fontFamily: "Rajdhani, sans-serif" }}>{va.language}</p>
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

            {/* ── Recommendations ── */}
            {activeTab === "recommendations" && animeData.recommendations && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.05em" }}>SIMILAR ANIME</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {animeData.recommendations.slice(0, 10).map((rec, idx) => {
                    const recTitle = rec.title.english || rec.title.romaji || rec.title.userPreferred || "Unknown Title";
                    return (
                      <div
                        key={rec.id}
                        onClick={() => (window.location.href = `/details/${rec.id}`)}
                        className="group relative bg-black border-2 border-red-600/20 overflow-hidden hover:border-red-600 transition-all cursor-pointer animate-fade-up"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <div className="relative aspect-[2/3] overflow-hidden">
                          <img src={getWeservImage(rec.image, 400)} alt={recTitle} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                          {rec.rating && (
                            <div className="absolute top-3 right-3 bg-red-600 text-white text-sm font-bold px-3 py-1 flex items-center gap-1" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                              <StarIcon size={14} />{(rec.rating / 10).toFixed(1)}
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-black">
                          <h4 className="text-white font-bold text-sm line-clamp-2 mb-1" style={{ fontFamily: "Rajdhani, sans-serif" }}>{recTitle}</h4>
                          <p className="text-gray-500 text-xs" style={{ fontFamily: "Rajdhani, sans-serif" }}>{rec.type} • {rec.episodes} EPS</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Relations ── */}
            {activeTab === "relations" && animeData.relations && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.05em" }}>RELATED ANIME</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-red-600 to-transparent"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {animeData.relations
                    .filter((r) => r.type !== "MANGA" && r.type !== "NOVEL" && r.type !== "MUSIC")
                    .map((relation, idx) => {
                      const relTitle = relation.title.english || relation.title.romaji || relation.title.userPreferred || "Unknown Title";
                      return (
                        <div
                          key={relation.id}
                          onClick={() => (window.location.href = `/details/${relation.id}`)}
                          className="group relative bg-black border-2 border-red-600/20 overflow-hidden hover:border-red-600 transition-all cursor-pointer animate-fade-up"
                          style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                          <div className="relative aspect-[2/3] overflow-hidden">
                            <img src={getWeservImage(relation.image, 400)} alt={relTitle} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                            <div className="absolute top-3 left-3 bg-black/80 border border-red-600 text-red-500 text-xs font-bold px-2 py-1 uppercase" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                              {relation.relationType}
                            </div>
                            {relation.rating && (
                              <div className="absolute top-3 right-3 bg-red-600 text-white text-sm font-bold px-3 py-1 flex items-center gap-1" style={{ fontFamily: "Bebas Neue, sans-serif" }}>
                                <StarIcon size={14} />{(relation.rating / 10).toFixed(1)}
                              </div>
                            )}
                          </div>
                          <div className="p-3 bg-black">
                            <h4 className="text-white font-bold text-sm line-clamp-2 mb-1" style={{ fontFamily: "Rajdhani, sans-serif" }}>{relTitle}</h4>
                            <p className="text-gray-500 text-xs" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                              {relation.type}{relation.episodes && ` • ${relation.episodes} EPS`}
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
    </div>
  );
}

export default AnimeDetailsPage;