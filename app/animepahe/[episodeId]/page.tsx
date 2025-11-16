"use client";
import React, { useState, useEffect, useRef } from "react";

interface VideoSource {
  url: string;
  isM3u8: boolean;
  type: string;
  quality: string;
}

interface SourcesData {
  headers: {
    Referer: string;
  };
  data: {
    sources: VideoSource[];
    download?: string;
  };
}

interface Episode {
  episodeNumber: number;
  episodeId: string;
  title: string;
  rating: string;
  aired: boolean;
  airDate: string;
  overview: string;
  thumbnail: string;
  provider: string;
}

interface EpisodesResponse {
  providerEpisodes: Episode[];
  title?: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  data?: {
    malId?: number;
    anilistId?: number;
    image?: string;
    color?: string;
    bannerImage?: string;
    title?: {
      romaji?: string;
      english?: string;
      native?: string;
    };
  };
}

interface VideoSource {
  url: string;
  isM3u8: boolean;
  type: string;
  quality: string;
}
const BackIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
    <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
  </svg>
);

const VolumeIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10.5 3.75a.75.75 0 00-1.264-.546L5.203 7H2.667a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h2.536l4.033 3.796a.75.75 0 001.264-.546V3.75zM16.45 5.05a.75.75 0 00-1.06 1.061 5.5 5.5 0 010 7.778.75.75 0 001.06 1.06 7 7 0 000-9.899z" />
    <path d="M14.329 7.172a.75.75 0 00-1.061 1.06 2.5 2.5 0 010 3.536.75.75 0 001.06 1.06 4 4 0 000-5.656z" />
  </svg>
);

const VolumeMuteIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10.5 3.75a.75.75 0 00-1.264-.546L5.203 7H2.667a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h2.536l4.033 3.796a.75.75 0 001.264-.546V3.75z" />
    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M13 8l4 4m0-4l-4 4" />
  </svg>
);

const FullscreenIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" />
  </svg>
);

const ExitFullscreenIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M3.707 6.293a1 1 0 010 1.414L6 10l-2.293 2.293a1 1 0 101.414 1.414L8 11.414V13a1 1 0 102 0V9a1 1 0 00-1-1H5a1 1 0 00-1 1 1 1 0 001.707.707zM13 3a1 1 0 011 1v1.586l2.293-2.293a1 1 0 111.414 1.414L15.414 7H17a1 1 0 010 2h-4a1 1 0 01-1-1V4a1 1 0 011-1z" />
  </svg>
);

const Forward10Icon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 8l3-3m0 0l-3-3m3 3H9a4 4 0 000 8h2" />
    <text x="12" y="16" fontSize="10" fill="currentColor" textAnchor="middle" fontWeight="bold">10</text>
  </svg>
);

const Rewind10Icon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 8l-3-3m0 0l3-3m-3 3h11a4 4 0 010 8h-2" />
    <text x="12" y="16" fontSize="10" fill="currentColor" textAnchor="middle" fontWeight="bold">10</text>
  </svg>
);

function AnimePahePlayer() {
  const [episodeId, setEpisodeId] = useState("");
  const [animeId, setAnimeId] = useState("");
  const [sourcesData, setSourcesData] = useState<SourcesData | null>(null);
  const [selectedQuality, setSelectedQuality] = useState("1080p");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [showEpisodesList, setShowEpisodesList] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [episodeRange, setEpisodeRange] = useState("all");
  const [animeTitle, setAnimeTitle] = useState<{romaji?: string; english?: string; native?: string} | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Video control states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getProxiedUrl = (originalUrl: string): string => {
    const proxyBase = "https://hls.shrina.dev/proxy?url=";
    return proxyBase + encodeURIComponent(originalUrl);
  };

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const epId = pathParts[pathParts.length - 1] || "";
    const params = new URLSearchParams(window.location.search);
    const anId = params.get('animeId') || "";

    const decodedEpId = decodeURIComponent(epId);
    setEpisodeId(decodedEpId);
    setAnimeId(anId);
  }, []);

  useEffect(() => {
    async function fetchEpisodes() {
      if (!animeId) return;

      try {
        setLoadingEpisodes(true);
        const response = await fetch(
          `https://kenjitsu.vercel.app/api/anilist/episodes/${animeId}?provider=animepahe`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: EpisodesResponse = await response.json();
        
        setEpisodes(data.providerEpisodes || []);
        
        let foundTitle = null;
        
        if (data.data && data.data.title) {
          foundTitle = data.data.title;
        } else if (data.title) {
          foundTitle = data.title;
        }
        
        if (foundTitle) {
          setAnimeTitle(foundTitle);
        }
      } catch (err) {
        console.error("Error fetching episodes:", err);
      } finally {
        setLoadingEpisodes(false);
      }
    }

    fetchEpisodes();
  }, [animeId]);

  useEffect(() => {
    async function fetchSources() {
      if (!episodeId) return;

      try {
        setLoading(true);
        setError(null);

        const version = episodeId.includes('dub') ? 'dub' : 'sub';
        const response = await fetch(
          `https://kenjitsu.vercel.app/api/animepahe/sources/${episodeId}?version=${version}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSourcesData(data);

        if (data.data.sources && data.data.sources.length > 0) {
          const qualities = data.data.sources.map((s: VideoSource) => s.quality);
          if (qualities.includes('1080p')) {
            setSelectedQuality('1080p');
          } else if (qualities.includes('720p')) {
            setSelectedQuality('720p');
          } else {
            setSelectedQuality(data.data.sources[0].quality);
          }
        }
      } catch (err) {
        console.error("Error fetching sources:", err);
        setError(err instanceof Error ? err.message : "Failed to load video sources");
      } finally {
        setLoading(false);
      }
    }

    fetchSources();
  }, [episodeId]);

  const selectedSource = sourcesData?.data.sources.find(
    (source) => source.quality === selectedQuality
  );

  const proxiedVideoUrl = selectedSource ? getProxiedUrl(selectedSource.url) : null;

  useEffect(() => {
    if (!proxiedVideoUrl || !videoRef.current) return;

    const video = videoRef.current;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          setBuffered((bufferedEnd / duration) * 100);
        }
      }
    };
    
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('progress', handleProgress);

    const loadVideo = () => {
      if (window.Hls && window.Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new window.Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hls.loadSource(proxiedVideoUrl);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.ERROR, (_event: string, data: unknown) => {
          const errorData = data as { fatal?: boolean; type?: string; details?: string };
          if (errorData.fatal) {
            switch (errorData.type) {
              case window.Hls?.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, trying to recover...');
                hls.startLoad();
                break;
              case window.Hls?.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.error('Fatal error:', errorData);
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = proxiedVideoUrl;
      }
    };

    if (window.Hls) {
      loadVideo();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.4.12';
      script.async = true;
      script.onload = loadVideo;
      document.head.appendChild(script);
    }

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('progress', handleProgress);
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [proxiedVideoUrl]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };
  
  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ([' ', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      
      switch(e.key) {
        case ' ':
          togglePlay();
          break;
        case 'ArrowLeft':
          skip(-10);
          break;
        case 'ArrowRight':
          skip(10);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, isFullscreen, isMuted]);
  
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      try {
        await containerRef.current.requestFullscreen();
        
        // Lock to landscape orientation on mobile devices
        if ('orientation' in screen && 'lock' in (screen.orientation as ScreenOrientation & { lock: (orientation: string) => Promise<void> })) {
          try {
            await (screen.orientation as ScreenOrientation & { lock: (orientation: string) => Promise<void> }).lock('landscape').catch(() => {
              // Fallback: try landscape-primary if landscape fails
              (screen.orientation as ScreenOrientation & { lock: (orientation: string) => Promise<void> }).lock('landscape-primary').catch(() => {});
            });
          } catch (err) {
            console.log('Orientation lock not supported');
          }
        }
      } catch (err) {
        console.error('Fullscreen request failed:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        
        // Unlock orientation when exiting fullscreen
        if ('orientation' in screen && 'unlock' in (screen.orientation as ScreenOrientation & { unlock: () => void })) {
          (screen.orientation as ScreenOrientation & { unlock: () => void }).unlock();
        }
      } catch (err) {
        console.error('Exit fullscreen failed:', err);
      }
    }
  };
  
  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };
  
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleQualityChange = (quality: string) => {
    const currentTime = videoRef.current?.currentTime || 0;
    const wasPlaying = !videoRef.current?.paused;
    
    setSelectedQuality(quality);
    setShowQualityMenu(false);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime;
        if (wasPlaying) {
          videoRef.current.play().catch(e => console.log('Play failed:', e));
        }
      }
    }, 100);
  };

  const handleEpisodeChange = (newEpisodeId: string) => {
    const params = new URLSearchParams(window.location.search);
    const newUrl = `${window.location.pathname.split('/').slice(0, -1).join('/')}/${encodeURIComponent(newEpisodeId)}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
    setEpisodeId(newEpisodeId);
  };

  const currentEpisode = episodes.find(ep => ep.episodeId === episodeId);

  const filteredEpisodes = episodes.filter(episode => {
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

  if (!episodeId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-3 sm:p-4">
        <div className="text-center space-y-4 sm:space-y-6 max-w-md px-4">
          <div className="text-4xl sm:text-6xl">📺</div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            No Episode Selected
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            Please select an episode to start watching
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto text-sm sm:text-base"
          >
            <BackIcon />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-3 sm:p-4">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Loading your anime...
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">Fetching video sources</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-3 sm:p-4">
        <div className="text-center space-y-4 sm:space-y-6 max-w-md px-4">
          <div className="text-4xl sm:text-6xl">⚠️</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-red-500">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto text-sm sm:text-base"
          >
            <BackIcon />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 space-y-3 sm:space-y-6">
        <div 
          ref={containerRef}
          className="relative w-full bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl group"
          onMouseMove={resetControlsTimeout}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {proxiedVideoUrl ? (
            <>
              <video
                ref={videoRef}
                className="w-full aspect-video bg-black pointer-events-auto"
                style={{ objectFit: 'contain' }}
                playsInline
                onClick={togglePlay}
                disablePictureInPicture
                disableRemotePlayback
                onContextMenu={(e) => e.preventDefault()}
              />
              
              <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 sm:w-20 sm:h-20 bg-red-600/90 hover:bg-red-500 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-2xl"
                  >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </button>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 space-y-1 sm:space-y-2 pointer-events-auto">
                  <div className="relative group/progress h-2 flex items-center">
                    <div className="absolute inset-0 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-500 transition-all"
                        style={{ width: `${buffered}%` }}
                      />
                    </div>
                    
                    <div className="absolute inset-0 h-1 rounded-full overflow-hidden pointer-events-none">
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
                      className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer z-10"
                    />
                    
                    <div 
                      className="absolute w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full shadow-lg pointer-events-none transition-opacity opacity-0 group-hover/progress:opacity-100 z-20"
                      style={{ 
                        left: `calc(${(currentTime / duration) * 100}% - 6px)`,
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-white flex-wrap gap-2">
                    <div className="flex items-center gap-1 sm:gap-3 flex-wrap">
                      <button onClick={togglePlay} className="hover:text-red-400 transition-colors p-1 sm:p-2">
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                      </button>
                      
                      <button onClick={() => skip(-10)} className="hover:text-red-400 transition-colors p-1 sm:p-2" title="Rewind 10s">
                        <Rewind10Icon />
                      </button>
                      
                      <button onClick={() => skip(10)} className="hover:text-red-400 transition-colors p-1 sm:p-2" title="Forward 10s">
                        <Forward10Icon />
                      </button>
                      
                      <div className="hidden sm:flex items-center gap-2 group/volume">
                        <button onClick={toggleMute} className="hover:text-red-400 transition-colors p-2">
                          {isMuted || volume === 0 ? <VolumeMuteIcon /> : <VolumeIcon />}
                        </button>
                        
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-0 group-hover/volume:w-20 transition-all duration-300 h-1 appearance-none bg-transparent cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, white 0%, white ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
                          }}
                        />
                      </div>
                      
                      <button onClick={toggleMute} className="sm:hidden hover:text-red-400 transition-colors p-1">
                        {isMuted || volume === 0 ? <VolumeMuteIcon /> : <VolumeIcon />}
                      </button>
                      
                      <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-2">
                      {sourcesData?.data.download && (
                        <a
                          href={sourcesData.data.download}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 sm:p-2 hover:text-green-400 transition-colors"
                          title="Download Episode"
                        >
                          <DownloadIcon />
                        </a>
                      )}
                      
                      <div className="relative">
                        <button
                          onClick={() => setShowQualityMenu(!showQualityMenu)}
                          className="px-2 py-1 sm:px-3 sm:py-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
                        >
                          {selectedQuality}
                        </button>
                        {showQualityMenu && sourcesData && (
                          <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-lg rounded-lg overflow-hidden shadow-2xl border border-gray-700 min-w-[80px] sm:min-w-[100px] z-50">
                            {sourcesData.data.sources.map((source) => (
                              <button
                                key={source.quality}
                                onClick={() => handleQualityChange(source.quality)}
                                className={`w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-red-600 transition-colors ${
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
                      
                      <button onClick={toggleFullscreen} className="hover:text-red-400 transition-colors p-1 sm:p-2">
                        {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="aspect-video flex items-center justify-center bg-gray-800">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400 text-sm sm:text-base">No video source available</p>
              </div>
            </div>
          )}
        </div>

        {currentEpisode && (
          <div className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-xl border border-red-900/50">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              {(() => {
                const currentIndex = episodes.findIndex(ep => ep.episodeId === episodeId);
                const previousEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
                
                return previousEpisode ? (
                  <button
                    onClick={() => handleEpisodeChange(previousEpisode.episodeId)}
                    className="flex flex-row sm:flex-col items-center justify-center bg-black hover:bg-red-900/30 p-3 sm:p-4 rounded-xl transition-all transform hover:scale-105 border border-red-900/50 min-w-0 sm:min-w-[120px] gap-2 sm:gap-0"
                    title={`Episode ${previousEpisode.episodeNumber}: ${previousEpisode.title}`}
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
              
              <div className="flex-1 flex flex-col sm:flex-row gap-3 sm:gap-6 bg-gradient-to-br from-red-950/50 to-black/50 p-3 sm:p-4 rounded-xl border border-red-900/50">
                {currentEpisode.thumbnail && (
                  <img
                    src={currentEpisode.thumbnail}
                    alt={currentEpisode.title}
                    className="w-full sm:w-40 h-32 sm:h-24 object-cover rounded-xl shadow-lg border border-red-900/30"
                  />
                )}
                <div className="flex-1 space-y-1 sm:space-y-2">
                  <div className="mb-1 sm:mb-2">
                    {animeTitle ? (
                      <button
                        onClick={() => window.location.href = `/details/${animeId}`}
                        className="text-left hover:text-red-400 transition-colors group w-full"
                      >
                        <h1 className="text-base sm:text-xl font-bold text-white group-hover:underline line-clamp-1">
                          {animeTitle.english || animeTitle.romaji || animeTitle.native || "No Title"}
                        </h1>
                      </button>
                    ) : (
                      <div className="text-base sm:text-xl font-bold text-gray-500">
                        Loading title...
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs sm:text-sm text-red-400 font-semibold tracking-wider uppercase">
                    NOW WATCHING
                  </div>
                  <h2 className="text-lg sm:text-2xl font-bold text-red-500">
                    Episode {currentEpisode.episodeNumber}
                  </h2>
                  <p className="text-sm sm:text-lg text-white font-medium line-clamp-1">{currentEpisode.title}</p>
                  {currentEpisode.overview && (
                    <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">{currentEpisode.overview}</p>
                  )}
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 pt-1">
                    <span>Aired: {currentEpisode.airDate}</span>
                  </div>
                </div>
              </div>
              
              {(() => {
                const currentIndex = episodes.findIndex(ep => ep.episodeId === episodeId);
                const nextEpisode = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;
                
                return nextEpisode ? (
                  <button
                    onClick={() => handleEpisodeChange(nextEpisode.episodeId)}
                    className="flex flex-row sm:flex-col items-center justify-center bg-gradient-to-br from-red-600 to-red-900 hover:from-red-500 hover:to-red-800 p-3 sm:p-4 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-red-900/50 min-w-0 sm:min-w-[120px] gap-2 sm:gap-0"
                    title={`Episode ${nextEpisode.episodeNumber}: ${nextEpisode.title}`}
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

            {loadingEpisodes ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredEpisodes.length === 0 ? (
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
                      {episode.thumbnail && (
                        <img
                          src={episode.thumbnail}
                          alt={episode.title}
                          className="w-full h-16 sm:h-24 object-cover rounded-md sm:rounded-lg"
                        />
                      )}
                      <div className="font-bold text-xs sm:text-sm">Episode {episode.episodeNumber}</div>
                      <div className="text-[10px] sm:text-xs opacity-80 line-clamp-2">{episode.title}</div>
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

export default AnimePahePlayer;