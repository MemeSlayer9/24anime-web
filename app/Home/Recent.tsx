"use client";

import Link from "next/link";
import { useState } from "react";
import RecentAnimepahe from './RecentAnimepahe'
import RecentHianime from './RecentHianime'

export default function Home() {
  const [showHianime, setShowHianime] = useState(true);

  return (
    <div>
      <div className="ml-8 mb-6 bg-black">
        {/* Recent Episodes Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Recent Episodes
          </h1>
      
        </div>

        {/* Toggle Switch */}
        <div className="inline-flex items-center gap-3 px-5 py-3 bg-black border border-gray-800 rounded-xl shadow-lg hover:shadow-xl hover:border-gray-700 transition-all duration-300">
          <span 
            className={`text-sm font-semibold tracking-wide transition-all duration-300 ${
              !showHianime 
                ? 'text-white scale-105' 
                : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            Animepahe
          </span>
          
          <button
            role="switch"
            aria-checked={showHianime}
            aria-label="Toggle between Animepahe and Hianime"
            onClick={() => setShowHianime(!showHianime)}
            className="relative inline-flex items-center h-8 w-16 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black hover:scale-105"
            style={{
              backgroundColor: showHianime ? 'red' : 'red'
            }}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out ${
                showHianime ? 'translate-x-9' : 'translate-x-1'
              }`}
              style={{
                boxShadow: showHianime 
                  ? 'red' 
                  : 'red'
              }}
            />
          </button>
          
          <span 
            className={`text-sm font-semibold tracking-wide transition-all duration-300 ${
              showHianime 
                ? 'text-white scale-105' 
                : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            Hianime
          </span>
        </div>
      </div>

      {showHianime ? <RecentHianime /> : <RecentAnimepahe />}
    </div>
  );
}