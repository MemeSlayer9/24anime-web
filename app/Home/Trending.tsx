"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

interface RawAnimeItem {
  id: number;
  title?: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  coverImage?: {
    extraLarge?: string;
    large?: string;
  };
  bannerImage?: string;
  description?: string;
  status?: string;
  seasonYear?: number;
  averageScore?: number;
  meanScore?: number;
  genres?: string[];
  episodes?: number;
  duration?: number;
  format?: string;
}

interface AnimeItem {
  id: number;
  title: { romaji?: string; english?: string; native?: string };
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
}

function normalizeStatus(status: string): string {
  switch (status) {
    case "RELEASING": return "Ongoing";
    case "FINISHED": return "Finished";
    case "NOT_YET_RELEASED": return "Upcoming";
    case "CANCELLED": return "Cancelled";
    case "HIATUS": return "Hiatus";
    default: return status;
  }
}

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

const ChevronLeftIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

function Carousel() {
  const { width } = useWindowDimensions();
  const [animeData, setAnimeData] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTrending() {
      try {
        setLoading(true);
        const response = await axios.get("maaa/api/trending");
        const data = response.data;

        if (data.success && Array.isArray(data.media)) {
          const mapped: AnimeItem[] = data.media.slice(0, 10).map((item: RawAnimeItem) => ({
            id: item.id,
            title: {
              romaji: item.title?.romaji,
              english: item.title?.english,
              native: item.title?.native,
            },
            image: item.coverImage?.extraLarge || item.coverImage?.large || "",
            cover: item.bannerImage || item.coverImage?.extraLarge || "",
            description: item.description || "",
            status: normalizeStatus(item.status || ""),
            releaseDate: item.seasonYear || 0,
            rating: item.averageScore ?? item.meanScore,
            genres: item.genres || [],
            totalEpisodes: item.episodes ?? null,
            duration: item.duration,
            type: item.format || "TV",
          }));
          setAnimeData(mapped);
        } else {
          throw new Error("Invalid data structure");
        }
      } catch (err) {
        console.error("Error fetching anime data:", err);
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || err.message || "Failed to load data");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTrending();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || animeData.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % animeData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, animeData.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % animeData.length);
    setIsAutoPlaying(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + animeData.length) % animeData.length);
    setIsAutoPlaying(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!isSwiping) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > 50) distance > 0 ? goToNext() : goToPrev();
    setIsSwiping(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (width > 768) return;
    setTouchStart(e.clientX);
    setTouchEnd(e.clientX);
    setIsSwiping(true);
  };
  const handleMouseMove = (e: React.MouseEvent) => { if (isSwiping) setTouchEnd(e.clientX); };
  const handleMouseUp = () => {
    if (!isSwiping) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > 50) distance > 0 ? goToNext() : goToPrev();
    setIsSwiping(false);
  };

  if (loading) {
    return (
      <div className="relative w-full h-[600px] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading trending anime...</p>
        </div>
      </div>
    );
  }

  if (error || !animeData || animeData.length === 0) {
    return (
      <div className="relative w-full h-[600px] bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">{error || "No anime data available"}</div>
      </div>
    );
  }

  const isMobile = width <= 768;
  const currentAnime = animeData[currentIndex];
  const title = currentAnime.title.english || currentAnime.title.romaji || "Unknown Title";

  return (
    <div
      ref={carouselRef}
      className="relative w-full overflow-hidden select-none"
      style={{ height: isMobile ? '500px' : '700px' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsSwiping(false)}
    >
      {animeData.map((item, index) => (
        <div
          key={item.id}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: index === currentIndex ? 1 : 0, pointerEvents: index === currentIndex ? 'auto' : 'none' }}
        >
          <img
            src={isMobile ? (item.image || item.cover) : (item.cover || item.image)}
            alt={item.title.english || item.title.romaji || ""}
            className="w-full h-full object-cover"
            draggable="false"
            onError={(e) => {
              const fallback = isMobile ? item.cover : item.image;
              if (fallback && e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
        </div>
      ))}

      <div className="relative h-full flex items-end pb-20 md:pb-32 pointer-events-none">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="max-w-3xl space-y-4 md:space-y-6">
            <h1
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight"
              style={{ textShadow: '2px 2px 20px rgba(0,0,0,0.8)' }}
            >
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
              {currentAnime.rating != null && (
                <div className="flex items-center gap-1 bg-yellow-500/90 text-black px-2 py-0.5 rounded-full font-semibold">
                  <StarIcon />
                  <span>{(currentAnime.rating / 10).toFixed(1)}</span>
                </div>
              )}
              <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-medium">
                {currentAnime.type}
              </span>
              {currentAnime.releaseDate > 0 && (
                <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-medium">
                  {currentAnime.releaseDate}
                </span>
              )}
              <span className={`px-2 py-0.5 rounded-full font-medium ${
                currentAnime.status === 'Ongoing'
                  ? 'bg-green-500/90 text-white'
                  : currentAnime.status === 'Upcoming'
                  ? 'bg-purple-500/90 text-white'
                  : 'bg-blue-500/90 text-white'
              }`}>
                {currentAnime.status}
              </span>
              {!isMobile && (
                <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-medium">
                  {currentAnime.totalEpisodes || "?"} EP
                </span>
              )}
            </div>

            {!isMobile && currentAnime.genres && currentAnime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {currentAnime.genres.slice(0, 4).map((genre, idx) => (
                  <span key={idx} className="text-xs text-white/80 border border-white/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {!isMobile && (
              <p className="text-sm md:text-base text-gray-200 leading-relaxed line-clamp-2 max-w-2xl">
                {currentAnime.description?.replace(/<[^>]*>/g, '') || "No description available"}
              </p>
            )}

            <div className="flex flex-wrap gap-4 pt-4 pointer-events-auto">
              <button
                onClick={() => window.location.href = `/details/${currentAnime.id}`}
                className="group flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-red-500/50"
              >
                <span className="group-hover:translate-x-1 transition-transform inline-block">
                  <PlayIcon />
                </span>
                Watch Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {!isMobile && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
            aria-label="Next slide"
          >
            <ChevronRightIcon />
          </button>
        </>
      )}

      {!isMobile && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {animeData.map((_, index) => (
            <button
              key={index}
              onClick={() => { setCurrentIndex(index); setIsAutoPlaying(false); }}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex ? 'bg-red-600 w-8 h-2' : 'bg-white/40 hover:bg-white/60 w-2 h-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Carousel;