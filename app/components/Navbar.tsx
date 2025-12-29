"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Custom Icons
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);

const FireIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
  </svg>
);

const BookmarkIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);

const GenresIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
  </svg>
);

const AndroidIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24c-2.86-1.21-6.08-1.21-8.94 0L5.65 5.67c-.19-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85l1.84 3.18C4.08 11.36 2.5 14.34 2.5 17.5h19c0-3.16-1.58-6.14-3.9-8.02zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/>
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

interface NavLink {
  name: string;
  icon: React.ReactNode;
  href: string;
}

interface AnimeResult {
  id: string;
  malId: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
    userPreferred: string;
  };
  status: string;
  image: string;
  imageHash: string;
  cover: string | null;
  coverHash: string;
  popularity: number;
  description: string;
  rating: number;
  genres: string[];
  color: string | null;
  totalEpisodes: number;
  currentEpisodeCount: number;
  type: string;
  releaseDate: number | null;
}

export default function Navbar() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AnimeResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const sidebarSearchRef = useRef<HTMLDivElement>(null);

  const navLinks: NavLink[] = [
    { name: "Home", icon: <HomeIcon />, href: "/" },
    { name: "Trending", icon: <FireIcon />, href: "/List/Trending" },
    { name: "Recent", icon: <BookmarkIcon />, href: "/List/Recent-episodes" },
    { name: "Popular", icon: <StarIcon />, href: "/List/Popular" },
     { name: "Genres", icon: <GenresIcon />, href: "/List/Genres" },
    { name: "Schedule", icon: <CalendarIcon />, href: "/List/Schedule" },
    { name: "AnimeChart", icon: <ChartIcon />, href: "/List/AnimeChart" },
        { name: "AndroidApp", icon: <AndroidIcon />, href: "/List/AndroidApp" },

  ];

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current && !searchRef.current.contains(event.target as Node) &&
        sidebarSearchRef.current && !sidebarSearchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions when search query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`https://makgago.vercel.app/meta/anilist/${encodeURIComponent(searchQuery)}?page=1`);
        const data = await response.json();
        setSuggestions(data.results || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
      setSearchQuery("");
      setIsSidebarOpen(false);
    }
  };

  const handleSuggestionClick = (animeId: string) => {
    router.push(`/details/${animeId}`);
    setShowSuggestions(false);
    setSearchQuery("");
    setIsSidebarOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="shadow-xl sticky top-0 z-50" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16 gap-4">
            {/* Left Section: Menu Button + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-white p-2 rounded-lg hover:bg-red-900/20 transition-colors"
              >
                <MenuIcon />
              </button>
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <img 
                  src="/logo1.png" 
                  alt="Loading..." 
                  className="w-40 h-12 object-contain"
                  style={{ 
                    mixBlendMode: 'screen',
                    filter: 'contrast(1.2) brightness(1.1)'
                  }}
                />
              </Link>
            </div>
  
            {/* Center Section: Search Bar (Hidden on mobile) */}
            <div className="hidden md:flex flex-1 justify-center px-4">
              <div className="relative w-full max-w-2xl" ref={searchRef}>
                <input
                  type="text"
                  placeholder="Search anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  className="w-full px-4 py-2 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                />
                <button
                  onClick={handleSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <SearchIcon />
                </button>

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50">
                    {isLoading ? (
                      <div className="p-4 text-center text-gray-400">Loading...</div>
                    ) : suggestions.length > 0 ? (
                      <>
                        {suggestions.slice(0, 8).map((anime) => (
                          <div
                            key={anime.id}
                            onClick={() => handleSuggestionClick(anime.id)}
                            className="flex items-center gap-3 p-2.5 hover:bg-gray-800 cursor-pointer border-b border-gray-800 transition-colors"
                          >
                            <img
                              src={anime.image}
                              alt={anime.title.userPreferred}
                              className="w-10 h-14 object-cover rounded flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium text-sm truncate">
                                {anime.title.english || anime.title.romaji || anime.title.userPreferred}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 flex-wrap">
                                <span className="bg-red-900/30 text-red-400 px-1.5 py-0.5 rounded whitespace-nowrap">
                                  {anime.type}
                                </span>
                                <span className="truncate">{anime.status}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {suggestions.length > 8 && (
                          <button
                            onClick={handleSearch}
                            className="w-full p-3 text-center text-red-400 hover:text-red-300 hover:bg-gray-800 font-medium transition-colors border-t border-gray-800"
                          >
                            View More ({suggestions.length} results)
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="p-4 text-center text-gray-400">No results found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: '#0a0a0a' }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <img 
              src="/logo1.png" 
              alt="Loading..." 
              className="w-35 h-20 object-contain"
              style={{ 
                mixBlendMode: 'screen',
                filter: 'contrast(1.2) brightness(1.1)'
              }}
            />
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-white p-2 rounded-lg hover:bg-red-900/20 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Mobile Search Bar in Sidebar */}
        <div className="p-4 md:hidden border-b border-gray-700">
          <div className="relative" ref={sidebarSearchRef}>
            <input
              type="text"
              placeholder="Search anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              className="w-full px-4 py-2 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <SearchIcon />
            </button>

            {/* Mobile Suggestions Dropdown in Sidebar */}
            {showSuggestions && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-80 overflow-y-auto z-50">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-400">Loading...</div>
                ) : suggestions.length > 0 ? (
                  <>
                    {suggestions.slice(0, 6).map((anime) => (
                      <div
                        key={anime.id}
                        onClick={() => handleSuggestionClick(anime.id)}
                        className="flex items-center gap-2.5 p-2.5 hover:bg-gray-700 cursor-pointer border-b border-gray-700 transition-colors"
                      >
                        <img
                          src={anime.image}
                          alt={anime.title.userPreferred}
                          className="w-10 h-14 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm truncate leading-tight">
                            {anime.title.english || anime.title.romaji || anime.title.userPreferred}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="bg-red-900/30 text-red-400 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                              {anime.type}
                            </span>
                            <span className="truncate text-[10px]">{anime.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {suggestions.length > 6 && (
                      <button
                        onClick={handleSearch}
                        className="w-full p-3 text-center text-red-400 hover:text-red-300 hover:bg-gray-700 font-medium transition-colors border-t border-gray-700"
                      >
                        View More ({suggestions.length} results)
                      </button>
                    )}
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-400">No results found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <div className="p-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-3 text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200 px-4 py-3 rounded-lg"
              onClick={() => setIsSidebarOpen(false)}
            >
              {link.icon}
              <span className="font-medium">{link.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}