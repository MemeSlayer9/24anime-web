"use client";

import React, { useState, useEffect, useRef } from "react";

// Custom hook for window dimensions
function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    handleResize();
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { ...windowDimensions, mounted };
}

interface AnimeItem {
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
}

// Custom Icon Components
const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
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
  const { width, mounted } = useWindowDimensions();
  const [animeData, setAnimeData] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Touch/Swipe states
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTrending() {
      try {
        setLoading(true);
        const response = await fetch("https://makgago.vercel.app/meta/anilist/trending");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.results && Array.isArray(data.results)) {
          setAnimeData(data.results.slice(0, 10));
        } else {
          throw new Error("Invalid data structure");
        }
      } catch (err) {
        console.error("Error fetching anime data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    if (mounted) {
      fetchTrending();
    }
  }, [mounted]);

  // Auto-play functionality
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

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    
    const swipeThreshold = 50; // Minimum distance for a swipe
    const distance = touchStart - touchEnd;
    
    if (Math.abs(distance) > swipeThreshold) {
      if (distance > 0) {
        // Swiped left - go to next
        goToNext();
      } else {
        // Swiped right - go to previous
        goToPrev();
      }
    }
    
    setIsSwiping(false);
  };

  // Mouse handlers for desktop drag (optional enhancement)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (width > 768) return; // Only on mobile
    setTouchStart(e.clientX);
    setTouchEnd(e.clientX);
    setIsSwiping(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwiping) return;
    setTouchEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isSwiping) return;
    
    const swipeThreshold = 50;
    const distance = touchStart - touchEnd;
    
    if (Math.abs(distance) > swipeThreshold) {
      if (distance > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    
    setIsSwiping(false);
  };

  if (!mounted) {
    return (
      <div className="relative w-full h-[600px] bg-gray-900 animate-pulse" />
    );
  }

  if (loading) {
    return (
      <div className="relative w-full h-[600px] bg-gray-900 flex items-center justify-center">
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

  if (error || !animeData || animeData.length === 0) {
    return (
      <div className="relative w-full h-[600px] bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error || "No anime data available"}</div>
      </div>
    );
  }

  const isMobile = width <= 768;
  const currentAnime = animeData[currentIndex];
  const title = currentAnime.title.english || currentAnime.title.romaji || currentAnime.title.userPreferred || "Unknown Title";

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
      {/* Background Images with transition */}
      {animeData.map((item, index) => (
        <div
          key={item.id}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            opacity: index === currentIndex ? 1 : 0,
            pointerEvents: index === currentIndex ? 'auto' : 'none'
          }}
        >
        <img
            src={isMobile ? (item.image || item.cover) : (item.cover || item.image)}
            alt={item.title.english || item.title.romaji || ""}
            className="w-full h-full object-cover"
            draggable="false"
            onError={(e) => {
              const fallbackSrc = isMobile ? item.cover : item.image;
              if (fallbackSrc && e.currentTarget.src !== fallbackSrc) {
                e.currentTarget.src = fallbackSrc;
              }
            }}
          />
          
          {/* Multiple gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
        </div>
      ))}

      {/* Content Container */}
      <div className="relative h-full flex items-end pb-20 md:pb-32 pointer-events-none">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="max-w-3xl space-y-4 md:space-y-6">
            {/* Title with animation */}
            <h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight transform transition-all duration-700"
              style={{
                textShadow: '2px 2px 20px rgba(0,0,0,0.8)',
                opacity: 1,
                transform: 'translateY(0)'
              }}
            >
              {title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm md:text-base">
              {currentAnime.rating && (
                <div className="flex items-center gap-1 bg-yellow-500/90 text-black px-3 py-1 rounded-full font-semibold">
                  <StarIcon />
                  <span>{(currentAnime.rating / 10).toFixed(1)}</span>
                </div>
              )}
              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full font-medium">
                {currentAnime.type}
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full font-medium">
                {currentAnime.releaseDate}
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full font-medium">
                {currentAnime.totalEpisodes || "?"} EP
              </span>
              <span className={`px-3 py-1 rounded-full font-medium ${
                currentAnime.status === 'Ongoing' 
                  ? 'bg-green-500/90 text-white' 
                  : 'bg-blue-500/90 text-white'
              }`}>
                {currentAnime.status}
              </span>
            </div>

            {/* Genres */}
            {currentAnime.genres && currentAnime.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentAnime.genres.slice(0, 4).map((genre, idx) => (
                  <span 
                    key={idx}
                    className="text-xs md:text-sm text-white/80 border border-white/30 px-3 py-1 rounded-full backdrop-blur-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {!isMobile && (
              <p className="text-base md:text-lg text-gray-200 leading-relaxed line-clamp-3 max-w-2xl">
                {currentAnime.description?.replace(/<[^>]*>/g, '') || "No description available"}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4 pointer-events-auto">
              <button
                onClick={() => window.location.href = `/details/${currentAnime.id}`}
                className="group flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-red-500/50"
              >
                <span className="group-hover:translate-x-1 transition-transform inline-block">
                  <PlayIcon />
                </span>
                Watch Now
              </button>
              
              <button
                className="group flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-8 py-4 rounded-lg font-semibold text-base md:text-lg transition-all duration-300 border border-white/30"
              >
                <span className="group-hover:rotate-12 transition-transform inline-block">
                  <InfoIcon />
                </span>
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Desktop only */}
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

      {/* Pagination Dots - Desktop only */}
      {!isMobile && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {animeData.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
              }}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex 
                  ? 'bg-red-600 w-8 h-2' 
                  : 'bg-white/40 hover:bg-white/60 w-2 h-2'
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