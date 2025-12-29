'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';

interface AnimeItem {
  id: number;
  title: {
    userPreferred: string;
  };
  airingAt: number;
  image: string;
}

const Schedule: React.FC = () => {
  const [anime, setAnime] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [countdown, setCountdown] = useState<{ [key: number]: string }>({});

  const router = useRouter();

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchData = async () => {
    setLoading(true);
    try {
      let allResults: AnimeItem[] = [];
      for (let page = 1; page <= 6; page++) {
        const response = await axios.get(`https://juanito66.vercel.app/meta/anilist/airing-schedule?page=${page}`);
        const data: AnimeItem[] = response.data.results;
        allResults = [...allResults, ...data];
      }
      setAnime(allResults);
    } catch (error) {
      console.error('Error fetching anime:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCountdown = (airingAt: number): string => {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDifference = airingAt - currentTime;

    if (timeDifference <= 0) {
      return "Airing now";
    } else {
      const days = Math.floor(timeDifference / (60 * 60 * 24));
      const hours = Math.floor((timeDifference % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((timeDifference % (60 * 60)) / 60);
      const seconds = Math.floor(timeDifference % 60);
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
  };

  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdown = anime.reduce((acc: { [key: number]: string }, item) => {
        acc[item.id] = calculateCountdown(item.airingAt);
        return acc;
      }, {});
      setCountdown(newCountdown);
    };

    updateCountdowns();
    const timer = setInterval(updateCountdowns, 1000);

    return () => clearInterval(timer);
  }, [anime]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredAnime = anime.filter((item) => new Date(item.airingAt * 1000).getDay() === selectedDay);

  const handleNavigateToDetails = (id: number) => {
    router.push(`/details/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!anime.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-white text-xl">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Tabs Container */}
      <div className="bg-[#161616] py-2.5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide px-4 gap-4 md:justify-center">
            {daysOfWeek.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`px-6 py-2.5 whitespace-nowrap font-bold text-white text-base transition-all rounded-lg ${
                  selectedDay === index 
                    ? 'bg-blue-600 shadow-lg shadow-blue-500/50' 
                    : 'hover:bg-gray-800'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Anime List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnime.map((item, index) => {
            const airingDay = new Date(item.airingAt * 1000).getDay();
            const airingDayName = daysOfWeek[airingDay];
            const countdownText = countdown[item.id];

            return (
              <button
                key={`${item.id}-${index}`}
                onClick={() => handleNavigateToDetails(item.id)}
                className="bg-[#161616] rounded-xl overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all hover:scale-105 transform duration-200 text-left"
              >
                <div className="relative w-full h-[280px]">
                  <Image
                    src={item.image}
                    alt={item.title.userPreferred}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white text-base font-bold mb-2 line-clamp-2">
                      {item.title.userPreferred}
                    </h3>
                    <p className="text-yellow-400 text-sm font-semibold mb-1">{countdownText}</p>
                    <p className="text-gray-400 text-sm">Airs on: {airingDayName}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Schedule;