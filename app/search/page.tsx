"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

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

interface SearchResponse {
  currentPage: number;
  hasNextPage: boolean;
  results: AnimeResult[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState<AnimeResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    if (query) {
      fetchResults(query, currentPage);
    }
  }, [query, currentPage]);

  const fetchResults = async (searchQuery: string, page: number) => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch(
        `https://makgago.vercel.app/meta/anilist/${encodeURIComponent(searchQuery)}?page=${page}`
      );
      const data: SearchResponse = await response.json();
      
      setResults(data.results || []);
      setHasNextPage(data.hasNextPage || false);
    } catch (err) {
      setError("Failed to fetch search results. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Search Results for &quot;{query}&quot;
          </h1>
          {!isLoading && (
            <p className="text-gray-400">
              Found {results.length} results {currentPage > 1 && `(Page ${currentPage})`}
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && !error && results.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {results.map((anime) => (
                <Link
                  key={anime.id}
                  href={`/details/${anime.id}`}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105">
                    {/* Anime Image */}
                    <div className="relative aspect-[2/3]">
                      <img
                        src={anime.image}
                        alt={anime.title.userPreferred}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-xs line-clamp-3">
                            {anime.description ? stripHtml(anime.description) : "No description available"}
                          </p>
                        </div>
                      </div>

                      {/* Type Badge */}
                      <div className="absolute top-2 left-2">
                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                          {anime.type}
                        </span>
                      </div>

                      {/* Rating Badge */}
                      {anime.rating && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                            ★ {anime.rating / 10}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Anime Info */}
                    <div className="bg-gray-900 p-3">
                      <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2 group-hover:text-red-400 transition-colors">
                        {anime.title.english || anime.title.romaji || anime.title.userPreferred}
                      </h3>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {anime.genres.slice(0, 2).map((genre, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{anime.status}</span>
                        {anime.totalEpisodes && (
                          <span>{anime.totalEpisodes} eps</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 1
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                Previous
              </button>

              <span className="text-white font-medium">
                Page {currentPage}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  !hasNextPage
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* No Results */}
        {!isLoading && !error && results.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Results Found</h2>
            <p className="text-gray-400 mb-6">
              We couldn&apos;t find any anime matching &quot;{query}&quot;
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}