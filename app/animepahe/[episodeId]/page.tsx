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
}

// Custom Icons
const BackIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
  </svg>
);

const VolumeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10.5 3.75a.75.75 0 00-1.264-.546L5.203 7H2.667a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h2.536l4.033 3.796a.75.75 0 001.264-.546V3.75zM16.45 5.05a.75.75 0 00-1.06 1.061 5.5 5.5 0 010 7.778.75.75 0 001.06 1.06 7 7 0 000-9.899z" />
    <path d="M14.329 7.172a.75.75 0 00-1.061 1.06 2.5 2.5 0 010 3.536.75.75 0 001.06 1.06 4 4 0 000-5.656z" />
  </svg>
);

const VolumeMuteIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10.5 3.75a.75.75 0 00-1.264-.546L5.203 7H2.667a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h2.536l4.033 3.796a.75.75 0 001.264-.546V3.75z" />
    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M13 8l4 4m0-4l-4 4" />
  </svg>
);

const FullscreenIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" />
  </svg>
);

const ExitFullscreenIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M3.707 6.293a1 1 0 010 1.414L6 10l-2.293 2.293a1 1 0 101.414 1.414L8 11.414V13a1 1 0 102 0V9a1 1 0 00-1-1H5a1 1 0 00-1 1 1 1 0 001.707.707zM13 3a1 1 0 011 1v1.586l2.293-2.293a1 1 0 111.414 1.414L15.414 7H17a1 1 0 010 2h-4a1 1 0 01-1-1V4a1 1 0 011-1z" />
  </svg>
);

const Forward10Icon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.2 4.2 0 00-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 00-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 00-.1 3.2A4.6 4.6 0 004 9.5c0 4.6 2.7 5.7 5.5 6 .4.6.5 1 .5 2V21" />
    <text x="12" y="14" fontSize="8" fill="currentColor" textAnchor="middle" fontWeight="bold">10</text>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 8l3-3m0 0l-3-3m3 3H9a4 4 0 000 8h2" />
  </svg>
);

const Rewind10Icon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 8l-3-3m0 0l3-3m-3 3h11a4 4 0 010 8h-2" />
    <text x="12" y="14" fontSize="8" fill="currentColor" textAnchor="middle" fontWeight="bold">10</text>
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
  const [showTechnicalInfo, setShowTechnicalInfo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
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

  // Function to proxy the video URL
  const getProxiedUrl = (originalUrl: string): string => {
    const proxyBase = "https://hls.shrina.dev/proxy?url=";
    return proxyBase + encodeURIComponent(originalUrl);
  };

  // Extract episode ID and anime ID from URL
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const epId = pathParts[pathParts.length - 1] || "";
    const params = new URLSearchParams(window.location.search);
    const anId = params.get('animeId') || "";

    const decodedEpId = decodeURIComponent(epId);
    setEpisodeId(decodedEpId);
    setAnimeId(anId);
  }, []);

  // Fetch episodes list
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
      } catch (err) {
        console.error("Error fetching episodes:", err);
      } finally {
        setLoadingEpisodes(false);
      }
    }

    fetchEpisodes();
  }, [animeId]);

  // Fetch video sources
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

  // Initialize HLS.js
  useEffect(() => {
    if (!proxiedVideoUrl || !videoRef.current) return;

    const video = videoRef.current;
    
    // Add video event listeners
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
      // @ts-ignore
      if (window.Hls && window.Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        // @ts-ignore
        const hls = new window.Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hls.loadSource(proxiedVideoUrl);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.ERROR, (_event: any, data: any) => {
          if (data.fatal) {
            switch (data.type) {
              case window.Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, trying to recover...');
                hls.startLoad();
                break;
              case window.Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.error('Fatal error:', data);
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = proxiedVideoUrl;
      }
    };

    // @ts-ignore
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

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Auto-hide controls
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
  
  // Video control handlers
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
  
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
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
    setShowEpisodesList(false);
  };

  const currentEpisode = episodes.find(ep => ep.episodeId === episodeId);

  if (!episodeId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl">📺</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            No Episode Selected
          </h1>
          <p className="text-gray-400 text-lg">
            Please select an episode to start watching
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
            Loading your anime...
          </h2>
          <p className="text-gray-400">Fetching video sources</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-3xl font-bold text-red-500">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-400 text-lg">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
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
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-gray-700/50">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-white hover:text-red-400 transition-all group"
          >
            <BackIcon />
            <span className="font-semibold">Back</span>
          </button>

          <div className="flex items-center gap-3">
            {episodes.length > 0 && (
              <button
                onClick={() => setShowEpisodesList(!showEpisodesList)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                <ListIcon />
                Episodes
              </button>
            )}

            {sourcesData?.data.download && (
              <a
                href={sourcesData.data.download}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                <DownloadIcon />
                Download
              </a>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div 
          ref={containerRef}
          className="relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl group"
          onMouseMove={resetControlsTimeout}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {proxiedVideoUrl ? (
            <>
              <video
                ref={videoRef}
                className="w-full aspect-video bg-black [&::-webkit-media-controls]:hidden [&::-webkit-media-controls-enclosure]:hidden"
                playsInline
                onClick={togglePlay}
              />
              
              {/* Custom Controls Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                {/* Center Play/Pause Button */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                  <button
                    onClick={togglePlay}
                    className="w-20 h-20 bg-red-600/90 hover:bg-red-500 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-2xl"
                  >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </button>
                </div>
                
                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 pointer-events-auto">
                  {/* Progress Bar */}
                  <div className="relative group/progress">
                    {/* Buffer Bar */}
                    <div className="absolute top-1/2 -translate-y-1/2 h-1 w-full bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-500"
                        style={{ width: `${buffered}%` }}
                      />
                    </div>
                    
                    {/* Progress Bar Input */}
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1 appearance-none bg-transparent cursor-pointer relative z-10 
                        [&::-webkit-slider-thumb]:appearance-none 
                        [&::-webkit-slider-thumb]:w-4 
                        [&::-webkit-slider-thumb]:h-4 
                        [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:bg-red-500 
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:shadow-lg
                        [&::-webkit-slider-thumb]:opacity-0
                        group-hover/progress:[&::-webkit-slider-thumb]:opacity-100
                        [&::-webkit-slider-thumb]:transition-opacity
                        [&::-moz-range-thumb]:w-4 
                        [&::-moz-range-thumb]:h-4 
                        [&::-moz-range-thumb]:rounded-full 
                        [&::-moz-range-thumb]:bg-red-500 
                        [&::-moz-range-thumb]:border-0
                        [&::-moz-range-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:shadow-lg
                        [&::-moz-range-thumb]:opacity-0
                        group-hover/progress:[&::-moz-range-thumb]:opacity-100
                        [&::-moz-range-thumb]:transition-opacity"
                      style={{
                        background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(currentTime / duration) * 100}%, transparent ${(currentTime / duration) * 100}%, transparent 100%)`
                      }}
                    />
                  </div>
                  
                  {/* Control Buttons */}
                  <div className="flex items-center justify-between text-white">
                    {/* Left Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="hover:text-red-400 transition-colors p-2"
                      >
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                      </button>
                      
                      <button
                        onClick={() => skip(-10)}
                        className="hover:text-red-400 transition-colors p-2"
                        title="Rewind 10s"
                      >
                        <Rewind10Icon />
                      </button>
                      
                      <button
                        onClick={() => skip(10)}
                        className="hover:text-red-400 transition-colors p-2"
                        title="Forward 10s"
                      >
                        <Forward10Icon />
                      </button>
                      
                      {/* Volume Control */}
                      <div className="flex items-center gap-2 group/volume">
                        <button
                          onClick={toggleMute}
                          className="hover:text-red-400 transition-colors p-2"
                        >
                          {isMuted || volume === 0 ? <VolumeMuteIcon /> : <VolumeIcon />}
                        </button>
                        
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-0 group-hover/volume:w-20 transition-all duration-300 h-1 appearance-none bg-transparent cursor-pointer
                            [&::-webkit-slider-track]:h-1
                            [&::-webkit-slider-track]:rounded-full
                            [&::-webkit-slider-track]:bg-gray-600
                            [&::-webkit-slider-thumb]:appearance-none 
                            [&::-webkit-slider-thumb]:w-3 
                            [&::-webkit-slider-thumb]:h-3 
                            [&::-webkit-slider-thumb]:rounded-full 
                            [&::-webkit-slider-thumb]:bg-white 
                            [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-moz-range-track]:h-1
                            [&::-moz-range-track]:rounded-full
                            [&::-moz-range-track]:bg-gray-600
                            [&::-moz-range-thumb]:w-3 
                            [&::-moz-range-thumb]:h-3 
                            [&::-moz-range-thumb]:rounded-full 
                            [&::-moz-range-thumb]:bg-white 
                            [&::-moz-range-thumb]:border-0
                            [&::-moz-range-thumb]:cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, white 0%, white ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
                          }}
                        />
                      </div>
                      
                      {/* Time Display */}
                      <span className="text-sm font-medium">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    
                    {/* Right Controls */}
                    <div className="flex items-center gap-2">
                      {/* Quality Selector */}
                      <div className="relative">
                        <button
                          onClick={() => setShowQualityMenu(!showQualityMenu)}
                          className="px-3 py-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-sm font-semibold transition-colors"
                        >
                          {selectedQuality}
                        </button>
                        {showQualityMenu && sourcesData && (
                          <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-lg rounded-lg overflow-hidden shadow-2xl border border-gray-700 min-w-[100px]">
                            {sourcesData.data.sources.map((source) => (
                              <button
                                key={source.quality}
                                onClick={() => handleQualityChange(source.quality)}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-red-600 transition-colors ${
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
                        className="hover:text-red-400 transition-colors p-2"
                      >
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
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400">No video source available</p>
              </div>
            </div>
          )}
        </div>

        {/* Current Episode Info */}
        {currentEpisode && (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-700/50">
            <div className="flex gap-6">
              {currentEpisode.thumbnail && (
                <img
                  src={currentEpisode.thumbnail}
                  alt={currentEpisode.title}
                  className="w-40 h-24 object-cover rounded-xl shadow-lg"
                />
              )}
              <div className="flex-1 space-y-2">
                <div className="text-sm text-red-400 font-semibold tracking-wider uppercase">
                  NOW WATCHING
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                  Episode {currentEpisode.episodeNumber}
                </h2>
                <p className="text-lg text-white font-medium">{currentEpisode.title}</p>
                {currentEpisode.overview && (
                  <p className="text-gray-400 text-sm line-clamp-2">{currentEpisode.overview}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Aired: {currentEpisode.airDate}</span>
                  {currentEpisode.rating && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <StarIcon />
                      <span>{currentEpisode.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Episodes Grid */}
        {showEpisodesList && episodes.length > 0 && (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-700/50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                All Episodes
              </h3>
              <span className="text-gray-400 text-sm">{episodes.length} episodes</span>
            </div>

            {loadingEpisodes ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {episodes.map((episode) => (
                  <button
                    key={episode.episodeId}
                    onClick={() => handleEpisodeChange(episode.episodeId)}
                    className={`group text-left p-4 rounded-xl transition-all transform hover:scale-105 hover:shadow-xl ${
                      episode.episodeId === episodeId
                        ? 'bg-gradient-to-br from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/50'
                        : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 border border-gray-600/50'
                    }`}
                  >
                    <div className="space-y-2">
                      {episode.thumbnail && (
                        <img
                          src={episode.thumbnail}
                          alt={episode.title}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="font-bold text-sm">Episode {episode.episodeNumber}</div>
                      <div className="text-xs opacity-80 line-clamp-2">{episode.title}</div>
                      {episode.rating && (
                        <div className="flex items-center gap-1 text-yellow-400 text-xs">
                          <StarIcon />
                          <span>{episode.rating}</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Technical Info */}
        {sourcesData && (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden">
            <button
              onClick={() => setShowTechnicalInfo(!showTechnicalInfo)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <InfoIcon />
                <span className="font-semibold">Technical Information</span>
              </div>
              <ChevronDownIcon />
            </button>

            {showTechnicalInfo && (
              <div className="px-6 pb-6 space-y-4 text-sm">
                <div className="space-y-2">
                  <div className="text-gray-400 font-semibold">Episode ID</div>
                  <div className="bg-gray-900/50 p-3 rounded-lg font-mono text-xs break-all">
                    {episodeId}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-gray-400 font-semibold">Using Proxy</div>
                  <div className="bg-gray-900/50 p-3 rounded-lg font-mono text-xs">
                    hls.shrina.dev
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-gray-400 font-semibold">Available Qualities</div>
                  <div className="flex flex-wrap gap-2">
                    {sourcesData.data.sources.map((source) => (
                      <span
                        key={source.quality}
                        className="bg-gray-900/50 px-3 py-1 rounded-lg text-xs"
                      >
                        {source.quality} ({source.type.toUpperCase()})
                      </span>
                    ))}
                  </div>
                </div>

                {selectedSource && (
                  <div className="space-y-2">
                    <div className="text-gray-400 font-semibold">Current Source Details</div>
                    <div className="bg-gray-900/50 p-3 rounded-lg space-y-1 text-xs">
                      <div><span className="text-gray-500">Quality:</span> {selectedSource.quality}</div>
                      <div><span className="text-gray-500">Type:</span> {selectedSource.type.toUpperCase()}</div>
                      <div><span className="text-gray-500">Format:</span> {selectedSource.isM3u8 ? 'HLS (M3U8)' : 'Direct'}</div>
                      <div className="pt-2">
                        <div className="text-gray-500 mb-1">Original URL:</div>
                        <div className="font-mono break-all bg-gray-800/50 p-2 rounded">
                          {selectedSource.url}
                        </div>
                      </div>
                      <div className="pt-2">
                        <div className="text-gray-500 mb-1">Proxied Stream URL:</div>
                        <div className="font-mono break-all bg-gray-800/50 p-2 rounded">
                          {proxiedVideoUrl}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnimePahePlayer;