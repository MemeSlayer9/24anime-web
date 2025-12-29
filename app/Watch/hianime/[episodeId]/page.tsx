"use client";
import React, { useState, useEffect, useRef } from "react";

interface VideoSource {
  url: string;
  isM3u8: boolean;
  type: string;
  quality?: string;
}

interface Subtitle {
  url: string;
  lang: string;
  default?: boolean;
}

interface SourcesData {
  headers: {
    Referer: string;
  };
  data: {
    sources: VideoSource[];
    download?: string;
    subtitles?: Subtitle[];
    intro?: {
      start: number;
      end: number;
    };
    outro?: {
      start: number;
      end: number;
    };
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

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  </svg>
);

const VolumeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
  </svg>
);

const VolumeMuteIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
  </svg>
);

const FullscreenIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);

const ExitFullscreenIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
  </svg>
);

const SubtitleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2" />
    <path d="M6 14h4M14 14h4M6 10h12" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const Forward10Icon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    <text x="8" y="16" fontSize="10" fill="currentColor" fontWeight="bold">10</text>
  </svg>
);

const Rewind10Icon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    <text x="8" y="16" fontSize="10" fill="currentColor" fontWeight="bold">10</text>
  </svg>
);

function AnimePahePlayer() {
  const [episodeId, setEpisodeId] = useState("");
  const [animeId, setAnimeId] = useState("");
  const [sourcesData, setSourcesData] = useState<SourcesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [showEpisodesList, setShowEpisodesList] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [episodeRange, setEpisodeRange] = useState("all");
  const [animeTitle, setAnimeTitle] = useState<{romaji?: string; english?: string; native?: string} | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [version, setVersion] = useState<'sub' | 'dub'>('sub');

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);

  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState('');
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

   useEffect(() => {
    const currentEp = episodes.find(ep => ep.episodeId === episodeId);
    if (animeTitle && currentEp) {
      const title = animeTitle.english || animeTitle.romaji || animeTitle.native || "Anime";
      const pageTitle = `Episode ${currentEp.episodeNumber} - ${title}`;
      const description = currentEp.overview || `Watch ${title} Episode ${currentEp.episodeNumber}`;
  
      // Update document title
      document.title = pageTitle;
  
      // Update or create meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
  
      // Update or create Open Graph meta tags
      const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      ogTitle.setAttribute('content', pageTitle);
      if (!document.querySelector('meta[property="og:title"]')) {
        document.head.appendChild(ogTitle);
      }
  
      const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      ogDescription.setAttribute('content', description);
      if (!document.querySelector('meta[property="og:description"]')) {
        document.head.appendChild(ogDescription);
      }
  
      // Add thumbnail as og:image if available
      if (currentEp.thumbnail) {
        const ogImage = document.querySelector('meta[property="og:image"]') || document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        ogImage.setAttribute('content', currentEp.thumbnail);
        if (!document.querySelector('meta[property="og:image"]')) {
          document.head.appendChild(ogImage);
        }
      }
  
      // Twitter Card meta tags
      const twitterCard = document.querySelector('meta[name="twitter:card"]') || document.createElement('meta');
      twitterCard.setAttribute('name', 'twitter:card');
      twitterCard.setAttribute('content', 'summary_large_image');
      if (!document.querySelector('meta[name="twitter:card"]')) {
        document.head.appendChild(twitterCard);
      }
  
      const twitterTitle = document.querySelector('meta[name="twitter:title"]') || document.createElement('meta');
      twitterTitle.setAttribute('name', 'twitter:title');
      twitterTitle.setAttribute('content', pageTitle);
      if (!document.querySelector('meta[name="twitter:title"]')) {
        document.head.appendChild(twitterTitle);
      }
  
      const twitterDescription = document.querySelector('meta[name="twitter:description"]') || document.createElement('meta');
      twitterDescription.setAttribute('name', 'twitter:description');
      twitterDescription.setAttribute('content', description);
      if (!document.querySelector('meta[name="twitter:description"]')) {
        document.head.appendChild(twitterDescription);
      }
  
      if (currentEp.thumbnail) {
        const twitterImage = document.querySelector('meta[name="twitter:image"]') || document.createElement('meta');
        twitterImage.setAttribute('name', 'twitter:image');
        twitterImage.setAttribute('content', currentEp.thumbnail);
        if (!document.querySelector('meta[name="twitter:image"]')) {
          document.head.appendChild(twitterImage);
        }
      }
    }
  }, [animeTitle, episodes, episodeId]);
 

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
          `https://kenjitsu.vercel.app/api/anilist/episodes/${animeId}?provider=hianime`
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

        const response = await fetch(
          `https://kenjitsu.vercel.app/api/hianime/sources/${encodeURIComponent(episodeId)}?version=${version}&server=hd-2`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSourcesData(data);

        if (data.data.subtitles && data.data.subtitles.length > 0) {
          const validSubtitles = data.data.subtitles.filter((sub: Subtitle) => sub.lang !== 'thumbnails');
          setSubtitles(validSubtitles);

          const defaultSub = validSubtitles.find((sub: Subtitle) => sub.default);
          if (defaultSub) {
            setSelectedSubtitle(defaultSub.lang);
          } else if (validSubtitles.length > 0) {
            setSelectedSubtitle(validSubtitles[0].lang);
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
  }, [episodeId, version]);

  const m3u8Source = sourcesData?.data.sources.find((s: VideoSource) => s.isM3u8);
  const videoUrl = m3u8Source ? `https://proxys.ciphertv.dev/proxy?url=${encodeURIComponent(m3u8Source.url)}` : '';

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const existingTrackElements = video.querySelectorAll('track');
    existingTrackElements.forEach(track => track.remove());

    if (subtitles.length === 0) return;

    const defaultSubtitle = subtitles.find(s => s.default)?.lang || subtitles[0]?.lang;
    
    if (!selectedSubtitle && defaultSubtitle) {
      setSelectedSubtitle(defaultSubtitle);
    }

    const targetSubtitle = selectedSubtitle || defaultSubtitle;

    subtitles.forEach((subtitle) => {
      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.label = subtitle.lang;
      track.srclang = subtitle.lang.toLowerCase().replace(/\s+/g, '-');
      track.src = subtitle.url;
      
      if (subtitle.lang === targetSubtitle) {
        track.default = true;
      }
      
      video.appendChild(track);
    });

    const activateSubtitle = () => {
      if (!video.textTracks || video.textTracks.length === 0) return;
      
      const tracks = Array.from(video.textTracks);
      const targetLang = targetSubtitle?.toLowerCase().replace(/\s+/g, '-');
      
      tracks.forEach((track) => {
        track.mode = 'disabled';
      });
      
      let activated = false;
      tracks.forEach((track) => {
        if (track.language === targetLang || track.label === targetSubtitle) {
          track.mode = 'showing';
          activated = true;
        }
      });

      if (!activated && tracks.length > 0) {
        tracks[0].mode = 'showing';
      }

      if ('ontouchstart' in window) {
        requestAnimationFrame(() => {
          tracks.forEach((track) => {
            if (track.language === targetLang || track.label === targetSubtitle) {
              track.mode = 'showing';
            }
          });
        });
      }
    };

    activateSubtitle();
    
    const timeouts = [50, 100, 200, 500, 1000, 2000, 3000].map(delay =>
      setTimeout(activateSubtitle, delay)
    );

    const trackElements = video.querySelectorAll('track');
    const trackLoadHandler = () => {
      activateSubtitle();
      if ('ontouchstart' in window) {
        setTimeout(activateSubtitle, 100);
      }
    };
    
    trackElements.forEach((trackEl) => {
      trackEl.addEventListener('load', trackLoadHandler);
    });

    video.addEventListener('loadedmetadata', activateSubtitle);
    video.addEventListener('loadeddata', activateSubtitle);
    video.addEventListener('canplay', activateSubtitle);
    video.addEventListener('play', activateSubtitle);
    video.addEventListener('playing', activateSubtitle);
    
    if ('ontouchstart' in window) {
      video.addEventListener('touchstart', activateSubtitle, { once: true });
      video.addEventListener('click', activateSubtitle, { once: true });
    }

    return () => {
      timeouts.forEach(clearTimeout);
      trackElements.forEach((trackEl) => {
        trackEl.removeEventListener('load', trackLoadHandler);
      });
      video.removeEventListener('loadedmetadata', activateSubtitle);
      video.removeEventListener('loadeddata', activateSubtitle);
      video.removeEventListener('canplay', activateSubtitle);
      video.removeEventListener('play', activateSubtitle);
      video.removeEventListener('playing', activateSubtitle);
    };
  }, [subtitles, selectedSubtitle, videoUrl]);

  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;

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
          hlsRef.current = null;
        }

        const hls = new window.Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
          maxBufferSize: 60 * 1000 * 1000,
          maxBufferHole: 0.5,
          highBufferWatchdogPeriod: 2,
          nudgeOffset: 0.1,
          nudgeMaxRetry: 3,
          maxFragLookUpTolerance: 0.25,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: Infinity,
          liveDurationInfinity: false,
          enableWebVTT: true,
          enableIMSC1: true,
          enableCEA708Captions: true,
          stretchShortVideoTrack: false,
          maxAudioFramesDrift: 1,
          forceKeyFrameOnDiscontinuity: true,
          abrEwmaFastLive: 3.0,
          abrEwmaSlowLive: 9.0,
          abrEwmaFastVoD: 3.0,
          abrEwmaSlowVoD: 9.0,
          abrEwmaDefaultEstimate: 500000,
          abrBandWidthFactor: 0.95,
          abrBandWidthUpFactor: 0.7,
          abrMaxWithRealBitrate: false,
          maxStarvationDelay: 4,
          maxLoadingDelay: 4,
          minAutoBitrate: 0,
          enableSoftwareAES: true,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 1,
          manifestLoadingRetryDelay: 1000,
          manifestLoadingMaxRetryTimeout: 64000,
          startLevel: undefined,
          levelLoadingTimeOut: 10000,
          levelLoadingMaxRetry: 4,
          levelLoadingRetryDelay: 1000,
          levelLoadingMaxRetryTimeout: 64000,
          fragLoadingTimeOut: 20000,
          fragLoadingMaxRetry: 6,
          fragLoadingRetryDelay: 1000,
          fragLoadingMaxRetryTimeout: 64000,
          startFragPrefetch: false,
        });

        hls.loadSource(videoUrl);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });

        hls.on(window.Hls.Events.ERROR, (_event: string, data: { fatal?: boolean; type?: string }) => {
          if (data.fatal) {
            switch (data.type) {
              case window.Hls?.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case window.Hls?.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        video.load();
        video.play().catch(() => {});
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
  }, [videoUrl]);

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
    const styleId = 'custom-subtitle-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
      video::cue {
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        font-size: ${isFullscreen ? '2.5vw' : 'calc(0.8rem + 0.5vw)'};
        line-height: 1.4;
        padding: 0.2em 0.4em;
        border-radius: 0.2em;
      }
      
      video::-webkit-media-text-track-container {
        position: relative !important;
        bottom: ${isFullscreen ? '12%' : '15%'} !important;
        top: auto !important;
        padding: 0 5% !important;
      }
      
      video::-webkit-media-text-track-display {
        position: relative !important;
        bottom: 0 !important;
        padding: 0 !important;
      }
      
      @media (max-width: 640px) {
        video::cue {
          font-size: calc(0.7rem + 0.8vw);
        }
        video::-webkit-media-text-track-container {
          bottom: 20% !important;
          padding: 0 3% !important;
        }
      }
      
      @media (min-width: 641px) and (max-width: 1024px) {
        video::cue {
          font-size: calc(0.75rem + 0.6vw);
        }
        video::-webkit-media-text-track-container {
          bottom: 16% !important;
        }
      }
    `;
    
    return () => {
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, [isFullscreen]);

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

  const handleVersionChange = (newVersion: 'sub' | 'dub') => {
    const currentTime = videoRef.current?.currentTime || 0;
    const wasPlaying = !videoRef.current?.paused;

    setVersion(newVersion);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime;
        if (wasPlaying) {
          videoRef.current.play().catch(e => console.log('Play failed:', e));
        }
      }
    }, 100);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      try {
        await containerRef.current.requestFullscreen();
        if ('orientation' in screen && screen.orientation && 'lock' in screen.orientation) {
          try {
            const orientation = screen.orientation as ScreenOrientation & { 
              lock: (orientation: string) => Promise<void> 
            };
            await orientation.lock('landscape').catch(() => {
              orientation.lock('landscape-primary').catch(() => {});
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
        if ('orientation' in screen && screen.orientation && 'unlock' in screen.orientation) {
          const orientation = screen.orientation as ScreenOrientation & { 
            unlock: () => void 
          };
          orientation.unlock();
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

  const handleVideoTouch = (e: React.TouchEvent) => {
    e.stopPropagation();
    resetControlsTimeout();
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

  const handleSubtitleChange = (lang: string) => {
    setSelectedSubtitle(lang);
    setShowSubtitleMenu(false);

    if (!videoRef.current) return;

    const tracks = Array.from(videoRef.current.textTracks);
    tracks.forEach((track) => {
      if (lang && track.language === lang.toLowerCase().replace(/\s/g, '-')) {
        track.mode = 'showing';
      } else {
        track.mode = 'hidden';
      }
    });
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">📺</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">No Episode Selected</h1>
          <p className="text-gray-400 text-base sm:text-lg">Please select an episode to start watching</p>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Loading your anime...</h2>
          <p className="text-gray-400">Fetching video sources</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Oops! Something went wrong</h1>
          <p className="text-red-400 text-base sm:text-lg">{error}</p>
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
          className={`relative w-full bg-black overflow-hidden shadow-2xl group ${
            isFullscreen ? 'h-screen' : 'rounded-xl sm:rounded-2xl'
          }`}
          onMouseMove={resetControlsTimeout}
          onTouchStart={handleVideoTouch}
        >
          {videoUrl ? (
            <>
              <video
                ref={videoRef}
                className="w-full aspect-video bg-black"
                onClick={togglePlay}
                onContextMenu={(e) => e.preventDefault()}
                crossOrigin="anonymous"
              />

              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent transition-opacity duration-300 pointer-events-none ${
                  showControls ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center gap-4 sm:gap-8">
                  <button
                    onClick={() => skip(-10)}
                    className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-800/90 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-xl touch-manipulation pointer-events-auto"
                    title="Rewind 10s"
                  >
                    <Rewind10Icon />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600/90 hover:bg-red-500 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-2xl touch-manipulation pointer-events-auto"
                  >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </button>

                  <button
                    onClick={() => skip(10)}
                    className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-800/90 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-xl touch-manipulation pointer-events-auto"
                    title="Forward 10s"
                  >
                    <Forward10Icon />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 space-y-2 sm:space-y-4 pointer-events-auto">
                  <div className="relative w-full h-1 sm:h-2 bg-gray-600 rounded-full overflow-hidden cursor-pointer group">
                    <div
                      className="absolute inset-y-0 left-0 bg-gray-500"
                      style={{ width: `${buffered}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 bg-red-600 group-hover:bg-red-500 transition-colors"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <button
                        onClick={togglePlay}
                        className="w-8 h-8 sm:w-10 sm:h-10 hover:bg-gray-700/50 rounded-lg flex items-center justify-center transition-colors touch-manipulation"
                      >
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleMute}
                          className="w-8 h-8 sm:w-10 sm:h-10 hover:bg-gray-700/50 rounded-lg flex items-center justify-center transition-colors touch-manipulation"
                        >
                          {isMuted || volume === 0 ? <VolumeMuteIcon /> : <VolumeIcon />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-16 sm:w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer hidden sm:block"
                          style={{
                            background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${volume * 100}%, #4b5563 ${volume * 100}%, #4b5563 100%)`
                          }}
                        />
                      </div>

                      <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {sourcesData?.data.download && (
                        <a
                          href={sourcesData.data.download}
                          download
                          className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-xs font-semibold transition-all touch-manipulation flex items-center gap-1"
                          title="Download"
                        >
                          <DownloadIcon />
                        </a>
                      )}

                      <div className="flex items-center gap-1 bg-gray-800/80 rounded-lg p-1">
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

                      <div className="relative">
                        <button
                          onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                          className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-xs font-semibold transition-all touch-manipulation flex items-center gap-1"
                          title="Subtitles"
                        >
                       <SubtitleIcon /> 
                        </button>
                        {showSubtitleMenu && (
                          <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-2xl overflow-hidden min-w-[150px] max-h-[300px] overflow-y-auto z-50">
                            <button
                              onClick={() => handleSubtitleChange('')}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors ${
                                selectedSubtitle === '' ? 'bg-red-600 text-white' : 'text-gray-300'
                              }`}
                            >
                              Off
                            </button>
                            {subtitles.map((subtitle) => (
                              <button
                                key={subtitle.lang}
                                onClick={() => handleSubtitleChange(subtitle.lang)}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors ${
                                  selectedSubtitle === subtitle.lang ? 'bg-red-600 text-white' : 'text-gray-300'
                                }`}
                              >
                                {subtitle.lang}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={toggleFullscreen}
                        className="w-8 h-8 sm:w-10 sm:h-10 hover:bg-gray-700/50 rounded-lg flex items-center justify-center transition-colors touch-manipulation"
                        title="Fullscreen"
                      >
                        {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full aspect-video flex items-center justify-center bg-gray-900">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400">Loading video source...</p>
              </div>
            </div>
          )}
        </div>

        {currentEpisode && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-2xl border border-gray-700 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {(() => {
                const currentIndex = episodes.findIndex(ep => ep.episodeId === episodeId);
                const previousEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
                return previousEpisode ? (
                  <button
                    onClick={() => handleEpisodeChange(previousEpisode.episodeId)}
                    className="flex flex-row sm:flex-col items-center justify-center bg-black hover:bg-red-900/30 p-3 sm:p-4 rounded-xl transition-all transform hover:scale-105 border border-red-900/50 min-w-0 sm:min-w-[120px] gap-2 sm:gap-0"
                    title={`Episode ${previousEpisode.episodeNumber}: ${previousEpisode.title}`}
                  >
                    <BackIcon />
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Previous</div>
                      <div className="font-bold">EP {previousEpisode.episodeNumber}</div>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center justify-center bg-gray-800/50 p-3 sm:p-4 rounded-xl min-w-0 sm:min-w-[120px] text-gray-500 text-sm">
                    No Previous
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
                        <h2 className="text-lg sm:text-xl font-bold group-hover:underline">
                          {animeTitle.english || animeTitle.romaji || animeTitle.native || "No Title"}
                        </h2>
                      </button>
                    ) : (
                      <div className="text-gray-500 text-sm">
                        Loading title...
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-red-400">
                      Episode {currentEpisode.episodeNumber}
                    </h3>
                    <p className="text-base sm:text-lg text-gray-300">{currentEpisode.title}</p>
                  </div>

                  {currentEpisode.overview && (
                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{currentEpisode.overview}</p>
                  )}

                  <div className="text-xs sm:text-sm text-gray-500">
                    Aired: {currentEpisode.airDate}
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
                    <div className="text-center">
                      <div className="text-xs text-red-200">Next</div>
                      <div className="font-bold">EP {nextEpisode.episodeNumber}</div>
                    </div>
                    <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                ) : (
                  <div className="flex items-center justify-center bg-gray-800/50 p-3 sm:p-4 rounded-xl min-w-0 sm:min-w-[120px] text-gray-500 text-sm">
                    No Next
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {showEpisodesList && episodes.length > 0 && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-2xl border border-gray-700">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-red-400">All Episodes</h2>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
              <input
                type="text"
                placeholder="Search episodes..."
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

              <div className="text-sm text-gray-400 self-center">
                {filteredEpisodes.length} / {episodes.length} episodes
              </div>
            </div>

            {loadingEpisodes ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredEpisodes.length === 0 ? (
              <div className="text-center py-12 space-y-4">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
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
                    <div className="space-y-2">
                      {episode.thumbnail && (
                        <img
                          src={episode.thumbnail}
                          alt={episode.title}
                          className="w-full aspect-video object-cover rounded-lg shadow-md"
                        />
                      )}
                      <div className="text-xs sm:text-sm font-bold">Episode {episode.episodeNumber}</div>
                      <div className="text-xs line-clamp-2">{episode.title}</div>
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