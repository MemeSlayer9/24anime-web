'use client';

import React, { useEffect, useRef, useState } from 'react';
import type Hls from 'hls.js';

// Define Screen Orientation Lock interface
interface ScreenOrientationLock {
  lock: (orientation: 'landscape' | 'portrait' | 'landscape-primary' | 'landscape-secondary' | 'portrait-primary' | 'portrait-secondary' | 'any' | 'natural') => Promise<void>;
  unlock: () => void;
}

interface VideoSource {
  url: string;
  quality: string;
  isM3u8: boolean;
  type: string;
}

interface Subtitle {
  kind: string;
  url: string;
  lang: string;
}

interface VideoApiResponse {
  headers: {
    Referer: string;
  };
  data: {
    sources: VideoSource[];
    subtitles: Subtitle[];
    download: string;
    intro: {
      start: number;
      end: number;
    };
    outro: {
      start: number;
      end: number;
    };
  };
}

interface Episode {
  episodeId: string;
  title: string;
  episodeNumber: number;
  hasDub: boolean;
  hasSub: boolean;
  thumbnail?: string;
}

interface AnimeData {
  anilistId: number;
  malId: number;
  id: string;
  name: string;
  romaji: string;
  altnames: string;
  rating: string;
  posterImage: string;
  type: string;
  japanese: string;
  status: string;
  releaseDate: string;
  synopsis: string;
  score: string;
  genres: string[];
  studios: string[];
  producers: string[];
  episodes: {
    sub: number;
    dub: number;
  };
  totalEpisodes: number;
}

interface RelatedAnime {
  id: string;
  title: string;
  [key: string]: unknown;
}

interface AnimeApiResponse {
  data: AnimeData;
  relatedSeasons: RelatedAnime[];
  recommendedAnime: RelatedAnime[];
  relatedAnime: RelatedAnime[];
  providerEpisodes: Episode[];
}

// Icons Components
const PlayIcon = () => (
  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const Rewind10Icon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
  </svg>
);

const Forward10Icon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
  </svg>
);

const VolumeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
  </svg>
);

const VolumeMuteIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const FullscreenIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);

const ExitFullscreenIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [videoData, setVideoData] = useState<VideoApiResponse | null>(null);
  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodeId, setEpisodeId] = useState("");
  const [animeId, setAnimeId] = useState("");
  const [version, setVersion] = useState<'sub' | 'dub'>('sub');
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [playerMode, setPlayerMode] = useState<'video' | 'embed'>('video');
  const hlsRef = useRef<Hls | null>(null);

  // Video player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Episode list states
  const [searchQuery, setSearchQuery] = useState("");
  const [episodeRange, setEpisodeRange] = useState("all");
  const [showEpisodesList, setShowEpisodesList] = useState(true);

  // Extract episodeId and animeId from URL
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const episodeIdFromUrl = pathParts[pathParts.length - 1];
    
    if (episodeIdFromUrl && episodeIdFromUrl !== 'animekai') {
      setEpisodeId(decodeURIComponent(episodeIdFromUrl));
    }

    const urlParams = new URLSearchParams(window.location.search);
    const animeIdFromUrl = urlParams.get('animeId');
    
    if (animeIdFromUrl) {
      setAnimeId(animeIdFromUrl);
    }
  }, []);

  // Update document title when episode changes
  useEffect(() => {
    const currentEp = episodes.find(ep => ep.episodeId === episodeId);
    if (animeData && currentEp) {
      const title = animeData.name || animeData.romaji || animeData.japanese || "Anime";
      const pageTitle = `Episode ${currentEp.episodeNumber} - ${title}`;
      document.title = pageTitle;
    }
  }, [animeData, episodes, episodeId]);

  // Handle fullscreen change and screen orientation
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);

      // Lock to landscape when entering fullscreen on mobile
      const orientation = screen.orientation as ScreenOrientation & Partial<ScreenOrientationLock>;
      if (isNowFullscreen && orientation?.lock) {
        orientation.lock('landscape').catch(err => {
          console.log('Screen orientation lock failed:', err);
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      // Unlock orientation when component unmounts
      const orientation = screen.orientation as ScreenOrientation & Partial<ScreenOrientationLock>;
      if (orientation?.unlock) {
        orientation.unlock();
      }
    };
  }, []);

  // Fetch anime data
  const fetchAnimeData = async (id: string) => {
    try {
      const response = await fetch(`https://diddyepstein-delta.vercel.app/api/animekai/anime/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch anime data');
      }
      
      const data: AnimeApiResponse = await response.json();
      setAnimeData(data.data);
      setEpisodes(data.providerEpisodes);
    } catch (err) {
      console.error('Failed to fetch anime data:', err);
    }
  };

  // Fetch video source
  const fetchVideo = async (epId: string) => {
    if (!epId) return;

    setIsLoading(true);
    setError(null);
    setVideoData(null);

    try {
      const apiUrl = `https://diddyepstein-delta.vercel.app/api/animekai/sources/${epId}?version=${version}&server=server-1`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch video data');
      }
      
      const data: VideoApiResponse = await response.json();
      setVideoData(data);
      setSelectedQuality(data.data.sources[0]?.quality || 'auto');
    } catch (err) {
      setError('Failed to fetch video data from API: ' + (err as Error).message);
      setIsLoading(false);
    }
  };

  // Load anime data
  useEffect(() => {
    if (animeId) {
      const animeIdOnly = animeId.split('/')[0];
      fetchAnimeData(animeIdOnly);
    }
  }, [animeId]);

  // Load video when episode changes
  useEffect(() => {
    if (episodeId) {
      const episode = episodes.find(ep => ep.episodeId === episodeId);
      if (episode) {
        setCurrentEpisode(episode);
      }
      if (playerMode === 'video') {
        fetchVideo(episodeId);
      }
    }
  }, [episodeId, version, playerMode]);

  // Initialize video player
  useEffect(() => {
    if (!videoData || playerMode !== 'video') return;

    const video = videoRef.current;
    if (!video) return;

    const videoUrl = videoData.data.sources[0].url;
    const referer = videoData.headers.Referer;

    const initializePlayer = () => {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        setIsLoading(false);
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          xhrSetup: (xhr: XMLHttpRequest) => {
            xhr.setRequestHeader('Referer', referer);
          },
        });

        hlsRef.current = hls;
        hls.loadSource(videoUrl);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
        });

        hls.on(window.Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setError(`Video loading error: ${data.type}`);
            setIsLoading(false);
          }
        });
      } else {
        setError('HLS is not supported in this browser');
        setIsLoading(false);
      }
    };

    if (!window.Hls) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.onload = () => initializePlayer();
      script.onerror = () => {
        setError('Failed to load HLS.js library');
        setIsLoading(false);
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
      };
    } else {
      initializePlayer();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [videoData, playerMode]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / video.duration) * 100;
        setBuffered(bufferedPercent);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoData]);

  // Video control functions
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime += seconds;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen();
        // Lock to landscape orientation on mobile devices
        const orientation = screen.orientation as ScreenOrientation & Partial<ScreenOrientationLock>;
        if (orientation?.lock) {
          try {
            await orientation.lock('landscape');
          } catch (err) {
            console.log('Screen orientation lock not supported or failed:', err);
          }
        }
      } catch (err) {
        console.error('Fullscreen request failed:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        // Unlock orientation when exiting fullscreen
        const orientation = screen.orientation as ScreenOrientation & Partial<ScreenOrientationLock>;
        if (orientation?.unlock) {
          orientation.unlock();
        }
      } catch (err) {
        console.error('Exit fullscreen failed:', err);
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const handleVideoTouch = (e: React.TouchEvent) => {
    e.stopPropagation();
    resetControlsTimeout();
  };

  const handleVersionChange = (newVersion: 'sub' | 'dub') => {
    setVersion(newVersion);
  };

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    setShowQualityMenu(false);
    // Implement quality switching logic here
  };

  const handleEpisodeChange = (newEpisodeId: string) => {
    setEpisodeId(newEpisodeId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getWeservImage = (url: string, width: number = 400) => {
    if (!url) return '';
    const encodedUrl = encodeURIComponent(url);
    return `https://wsrv.nl/?url=${encodedUrl}&w=${width}&output=webp`;
  };

  // Filter episodes
  const filteredEpisodes = episodes.filter(ep => {
    const matchesSearch = ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ep.episodeNumber.toString().includes(searchQuery);
    
    if (episodeRange === 'all') return matchesSearch;
    
    const [start, end] = episodeRange.split('-').map(Number);
    return matchesSearch && ep.episodeNumber >= start && ep.episodeNumber <= end;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 space-y-3 sm:space-y-6">
        
        {/* Player Mode Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex bg-gray-800/80 rounded-lg p-1 gap-1">
            <button
              onClick={() => setPlayerMode('video')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                playerMode === 'video'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Video Player
            </button>
            <button
              onClick={() => setPlayerMode('embed')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                playerMode === 'embed'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Embed Player
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div 
          ref={containerRef}
          className={`relative w-full bg-black overflow-hidden shadow-2xl group ${
            isFullscreen ? 'h-screen' : 'rounded-xl sm:rounded-2xl'
          }`}
          onMouseMove={resetControlsTimeout}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {playerMode === 'embed' && currentEpisode ? (
            <div className="relative w-full">
              <iframe
                key={`embed-${animeId}-${currentEpisode.episodeNumber}-${version}`}
                src={`https://vidnest.fun/anime/${animeId.split('/')[1] || animeId}/${currentEpisode.episodeNumber}/${version}`}
                className={`w-full bg-black ${
                  isFullscreen ? 'h-screen' : 'aspect-video'
                }`}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ border: 'none' }}
              />
              <div className="absolute top-4 right-4 z-50">
                <div className="flex items-center gap-1 bg-gray-900/90 backdrop-blur-sm rounded-lg p-1 shadow-xl border border-gray-700">
                  <button
                    onClick={() => handleVersionChange('sub')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      version === 'sub'
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    SUB
                  </button>
                  <button
                    onClick={() => handleVersionChange('dub')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      version === 'dub'
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    DUB
                  </button>
                </div>
              </div>
            </div>
          ) : videoData ? (
            <>
              <video
                ref={videoRef}
                className={`w-full bg-black pointer-events-auto ${
                  isFullscreen ? 'h-screen' : 'aspect-video'
                }`}
                style={{ objectFit: 'contain' }}
                playsInline
                onClick={togglePlay}
                onTouchEnd={handleVideoTouch}
                disablePictureInPicture
                disableRemotePlayback
                onContextMenu={(e) => e.preventDefault()}
              />
              
              {/* Custom Video Controls */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                {/* Center Play/Pause Controls */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <button
                      onClick={() => skip(-10)}
                      className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-800/90 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-xl touch-manipulation"
                    >
                      <Rewind10Icon />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        togglePlay();
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600/90 hover:bg-red-500 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-2xl touch-manipulation"
                    >
                      {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <button
                      onClick={() => skip(10)}
                      className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-800/90 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-xl touch-manipulation"
                    >
                      <Forward10Icon />
                    </button>
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 space-y-2 pointer-events-auto">
                  {/* Progress Bar */}
                  <div className="relative group/progress h-3 sm:h-2 flex items-center">
                    <div className="absolute inset-0 h-2 sm:h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-500 transition-all"
                        style={{ width: `${buffered}%` }}
                      />
                    </div>
                    <div className="absolute inset-0 h-2 sm:h-1 rounded-full overflow-hidden pointer-events-none">
                      <div 
                        className="h-full bg-red-500 transition-all"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="absolute inset-0 w-full h-8 sm:h-2 opacity-0 cursor-pointer z-10 touch-manipulation"
                    />
                    <div 
                      className="absolute w-4 h-4 sm:w-3 sm:h-3 bg-red-500 rounded-full shadow-lg pointer-events-none transition-opacity opacity-0 group-hover/progress:opacity-100 z-20"
                      style={{ 
                        left: `calc(${(currentTime / duration) * 100}% - 8px)`,
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    />
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between text-white gap-2">
                    <div className="flex items-center gap-1 sm:gap-3">
                      <button onClick={togglePlay} className="hover:text-red-400 transition-colors p-2 touch-manipulation">
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                      </button>
                      <div className="hidden sm:flex items-center gap-2 group/volume">
                        <button onClick={toggleMute} className="hover:text-red-400 transition-colors p-2 touch-manipulation">
                          {isMuted || volume === 0 ? <VolumeMuteIcon /> : <VolumeIcon />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-0 group-hover/volume:w-20 transition-all duration-300 h-1 appearance-none bg-transparent cursor-pointer touch-manipulation"
                          style={{
                            background: `linear-gradient(to right, red 0%, red ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium whitespace-nowrap">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
                      {videoData?.data.download && (
                        <a
                          href={videoData.data.download}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:text-green-400 transition-colors touch-manipulation hidden sm:inline-flex"
                        >
                          <DownloadIcon />
                        </a>
                      )}
                      
                      {/* Sub/Dub Switcher */}
                      <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-800/80 rounded-lg p-0.5 sm:p-1">
                        <button
                          onClick={() => handleVersionChange('sub')}
                          className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs font-semibold transition-all touch-manipulation ${
                            version === 'sub'
                              ? 'bg-red-600 text-white shadow-lg'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          SUB
                        </button>
                        <button
                          onClick={() => handleVersionChange('dub')}
                          className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs font-semibold transition-all touch-manipulation ${
                            version === 'dub'
                              ? 'bg-red-600 text-white shadow-lg'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          DUB
                        </button>
                      </div>

                      {/* Quality Selector */}
                      <div className="relative">
                        <button
                          onClick={() => setShowQualityMenu(!showQualityMenu)}
                          className="px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-xs font-semibold transition-colors touch-manipulation min-w-[50px] sm:min-w-[60px]"
                        >
                          {selectedQuality}
                        </button>
                        {showQualityMenu && videoData && (
                          <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-lg rounded-lg overflow-hidden shadow-2xl border border-gray-700 min-w-[80px] z-50">
                            {videoData.data.sources.map((source) => (
                              <button
                                key={source.quality}
                                onClick={() => handleQualityChange(source.quality)}
                                className={`w-full px-4 py-3 text-left text-xs hover:bg-red-600 transition-colors touch-manipulation ${
                                  selectedQuality === source.quality
                                    ? 'bg-red-600 text-white font-bold'
                                    : 'text-gray-300'
                                }`}
                              >
                                {source.quality}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={toggleFullscreen} 
                        className="hover:text-red-400 transition-colors p-2 touch-manipulation flex items-center justify-center"
                      >
                        {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : error && error.includes('Dub version is not available') ? (
            <div className="aspect-video flex items-center justify-center bg-gray-800">
              <div className="text-center space-y-4 max-w-md px-4">
                <div className="text-5xl sm:text-6xl">🎙️</div>
                <h2 className="text-xl sm:text-2xl font-bold text-red-400">
                  Dub Not Available
                </h2>
                <p className="text-gray-300 text-sm sm:text-base">
                  The dubbed version is not available for this episode.
                </p>
                <button
                  onClick={() => setVersion('sub')}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  Switch to SUB
                </button>
              </div>
            </div>
          ) : (
            <div className="aspect-video flex items-center justify-center bg-gray-800">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400 text-sm sm:text-base">
                  {isLoading ? 'Loading video...' : 'Select an episode to start watching'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Episode Info Card */}
        {currentEpisode && (
          <div className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-xl border border-red-900/50">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              {/* Previous Episode Button */}
              {(() => {
                const currentIndex = episodes.findIndex(ep => ep.episodeId === episodeId);
                const previousEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
                
                return previousEpisode ? (
                  <button
                    onClick={() => handleEpisodeChange(previousEpisode.episodeId)}
                    className="flex flex-row sm:flex-col items-center justify-center bg-black hover:bg-red-900/30 p-3 sm:p-4 rounded-xl transition-all transform hover:scale-105 border border-red-900/50 min-w-0 sm:min-w-[120px] gap-2 sm:gap-0"
                    title={`Episode ${previousEpisode.episodeNumber}${previousEpisode.title ? `: ${previousEpisode.title}` : ''}`}
                  >
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 sm:mb-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-red-400 mb-1">Previous</span>
                      <span className="text-sm font-bold text-white">EP {previousEpisode.episodeNumber}</span>
                    </div>
                  </button>
                ) : (
                  <div className="hidden sm:flex flex-col items-center justify-center bg-black/50 p-4 rounded-xl min-w-[120px] opacity-30 border border-gray-800">
                    <svg className="w-8 h-8 mb-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-gray-600">No Previous</span>
                  </div>
                );
              })()}
              
              {/* Current Episode Info */}
              <div className="flex-1 flex flex-col sm:flex-row gap-3 sm:gap-6 bg-gradient-to-br from-red-950/50 to-black/50 p-3 sm:p-4 rounded-xl border border-red-900/50">
                {currentEpisode.thumbnail && (
                  <img
                    src={getWeservImage(currentEpisode.thumbnail)}
                    alt={currentEpisode.title || `Episode ${currentEpisode.episodeNumber}`}
                    className="w-full sm:w-40 h-32 sm:h-24 object-cover rounded-xl shadow-lg border border-red-900/30"
                  />
                )}
                <div className="flex-1 space-y-1 sm:space-y-2">
                  <div className="mb-1 sm:mb-2">
                    {animeData ? (
                      <h1 className="text-base sm:text-xl font-bold text-white line-clamp-1">
                        {animeData.name || animeData.romaji || "No Title"}
                      </h1>
                    ) : (
                      <div className="text-base sm:text-xl font-bold text-gray-500">
                        Loading title...
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-lg sm:text-2xl font-bold text-red-500">
                    Episode {currentEpisode.episodeNumber}
                  </h2>
                  {currentEpisode.title && (
                    <p className="text-sm sm:text-lg text-white font-medium line-clamp-1">{currentEpisode.title}</p>
                  )}
                  {animeData && (
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 pt-1">
                      <span>{animeData.type}</span>
                      <span>•</span>
                      <span>{animeData.status}</span>
                      <span>•</span>
                      <span>AniList ID: {animeData.anilistId}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Next Episode Button */}
              {(() => {
                const currentIndex = episodes.findIndex(ep => ep.episodeId === episodeId);
                const nextEpisode = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;
                
                return nextEpisode ? (
                  <button
                    onClick={() => handleEpisodeChange(nextEpisode.episodeId)}
                    className="flex flex-row sm:flex-col items-center justify-center bg-gradient-to-br from-red-600 to-red-900 hover:from-red-500 hover:to-red-800 p-3 sm:p-4 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-red-900/50 min-w-0 sm:min-w-[120px] gap-2 sm:gap-0"
                    title={`Episode ${nextEpisode.episodeNumber}${nextEpisode.title ? `: ${nextEpisode.title}` : ''}`}
                  >
                    <div className="flex flex-col items-center order-2 sm:order-1">
                      <span className="text-xs mb-1 text-white">Next</span>
                      <span className="text-sm font-bold text-white">EP {nextEpisode.episodeNumber}</span>
                    </div>
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 sm:mb-2 text-white order-1 sm:order-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                ) : (
                  <div className="hidden sm:flex flex-col items-center justify-center bg-black/50 p-4 rounded-xl min-w-[120px] opacity-30 border border-gray-800">
                    <svg className="w-8 h-8 mb-2 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-gray-600">No Next</span>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Episodes List */}
        {showEpisodesList && episodes.length > 0 && (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-xl border border-gray-700/50 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                All Episodes
              </h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search episode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 sm:px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-48 text-sm"
                />
                
                <select
                  value={episodeRange}
                  onChange={(e) => setEpisodeRange(e.target.value)}
                  className="px-3 sm:px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer text-sm"
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
                
                <span className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
                  {filteredEpisodes.length} / {episodes.length} episodes
                </span>
              </div>
            </div>

            {filteredEpisodes.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-400 text-base sm:text-lg">No episodes found matching your search.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setEpisodeRange("all");
                  }}
                  className="mt-4 px-4 sm:px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
                {filteredEpisodes.map((episode) => (
                  <button
                    key={episode.episodeId}
                    onClick={() => handleEpisodeChange(episode.episodeId)}
                    className={`group text-left p-2 sm:p-4 rounded-lg sm:rounded-xl transition-all transform hover:scale-105 hover:shadow-xl ${
                      episode.episodeId === episodeId
                        ? 'bg-gradient-to-br from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/50'
                        : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 border border-gray-600/50'
                    }`}
                  >
                    <div className="space-y-1 sm:space-y-2">
                      <img
                        src={getWeservImage(episode.thumbnail || animeData?.posterImage || '', 200)}
                        alt={episode.title || `Episode ${episode.episodeNumber}`}
                        className="w-full h-16 sm:h-24 object-cover rounded-md sm:rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = animeData?.posterImage || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300"%3E%3Crect fill="%23333" width="200" height="300"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="font-bold text-xs sm:text-sm">Episode {episode.episodeNumber}</div>
                      {episode.title && (
                        <div className="text-[10px] sm:text-xs opacity-80 line-clamp-2">{episode.title}</div>
                      )}
                      <div className="flex gap-1 mt-1">
                        {episode.hasSub && (
                          <span className="text-[8px] sm:text-xs bg-blue-500 px-1.5 py-0.5 rounded">SUB</span>
                        )}
                        {episode.hasDub && (
                          <span className="text-[8px] sm:text-xs bg-green-500 px-1.5 py-0.5 rounded">DUB</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}