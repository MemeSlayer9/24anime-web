"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

/* ─── tiny helpers ─── */
const fmtTime = (t: number): string => {
  if (isNaN(t)) return "0:00";
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
};

/* ─── font shorthands ─── */
const BB: React.CSSProperties = { fontFamily: "'Bebas Neue', sans-serif" };

/* ─── HLS helpers ─── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getHls = (): any => (window as any).Hls;

/* ─── types ─── */
export interface QualityStream {
  BANDWIDTH: string;
  RESOLUTION: string;
  url: string;
}

/* ─── icons ─── */
const Ico = {
  prev:   (): React.ReactElement => <svg width={18} height={18} fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>,
  next:   (): React.ReactElement => <svg width={18} height={18} fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 3.9V8.1L8.5 12zm7-6h2v12h-2z"/></svg>,
  play:   (): React.ReactElement => <svg width={26} height={26} fill="currentColor" viewBox="0 0 24 24" style={{marginLeft:3}}><path d="M8 5v14l11-7z"/></svg>,
  pause:  (): React.ReactElement => <svg width={26} height={26} fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>,
  playS:  (): React.ReactElement => <svg width={20} height={20} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>,
  pauseS: (): React.ReactElement => <svg width={20} height={20} fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>,
  vol:    (): React.ReactElement => <svg width={18} height={18} fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>,
  mute:   (): React.ReactElement => <svg width={18} height={18} fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>,
  fs:     (): React.ReactElement => <svg width={17} height={17} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>,
  exitFs: (): React.ReactElement => <svg width={17} height={17} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"/></svg>,
  cc:     (): React.ReactElement => <svg width={17} height={17} fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 11H5v-2h7v2zm7 0h-2v-2h2v2zm0-4H5V9h14v2z"/></svg>,
  gear:   (): React.ReactElement => <svg width={17} height={17} fill="currentColor" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
};

/* ─── styles ─── */
const PLAYER_STYLES = `
  .vp-prog-range{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
  .vp-vol-range{-webkit-appearance:none;width:68px;height:3px;border-radius:2px;outline:none;cursor:pointer}
  .vp-vol-range::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:10px;border-radius:50%;background:#fff;cursor:pointer}
  @keyframes vp-spin{to{transform:rotate(360deg)}}
  @keyframes vp-rpulse{
    0%,100%{box-shadow:0 0 24px rgba(192,21,32,.6),0 0 0 0 rgba(192,21,32,.3)}
    50%{box-shadow:0 0 40px rgba(192,21,32,.8),0 0 0 12px rgba(192,21,32,0)}}
  @keyframes vp-qpop{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .vp-qpop{animation:vp-qpop .15s ease forwards}
`;

/* ─── props ─── */
export interface VideoPlayerProps {
  src: string;
  streams?: QualityStream[];
  onVersionFallback?: () => void;
  isDub?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  showSkipButtons?: boolean;
}

/* ── helper: parse resolution label ── */
const resLabel = (resolution: string): string => {
  const h = resolution.split("x")[1];
  if (!h) return resolution;
  const n = parseInt(h, 10);
  if (n >= 2160) return "4K";
  if (n >= 1440) return "1440p";
  if (n >= 1080) return "1080p";
  if (n >= 720)  return "720p";
  if (n >= 480)  return "480p";
  if (n >= 360)  return "360p";
  return `${h}p`;
};

/* ── helper: sort streams best → worst ── */
const sortedStreams = (streams: QualityStream[]): QualityStream[] =>
  [...streams].sort((a, b) => parseInt(b.BANDWIDTH, 10) - parseInt(a.BANDWIDTH, 10));

/* ══════════════════════════════════════════════════════════════════ */
export default function VideoPlayer({
  src,
  streams = [],
  onVersionFallback,
  isDub = false,
  onPrev,
  onNext,
  showSkipButtons = true,
}: VideoPlayerProps): React.ReactElement {

  /* ─── player state ─── */
  const [isPlaying,    setIsPlaying]    = useState<boolean>(false);
  const [currentTime,  setCurrentTime]  = useState<number>(0);
  const [duration,     setDuration]     = useState<number>(0);
  const [volume,       setVolume]       = useState<number>(1);
  const [isMuted,      setIsMuted]      = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [buffered,     setBuffered]     = useState<number>(0);
  const [videoLoading, setVideoLoading] = useState<boolean>(true);

  /* ─── quality state ─── */
  // "auto" = master m3u8 (ABR); number = index in sortedStreams
  const [quality,      setQuality]      = useState<"auto" | number>("auto");
  const [showQMenu,    setShowQMenu]    = useState<boolean>(false);
  const sorted = sortedStreams(streams);

  /* active src switches between master and specific stream url */
  const activeSrc = quality === "auto" ? src : (sorted[quality as number]?.url ?? src);

  const videoRef      = useRef<HTMLVideoElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hlsRef        = useRef<any>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const ctrlTimeout   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingRef  = useRef<boolean>(false);
  const qMenuRef      = useRef<HTMLDivElement>(null);

  /* ─── close quality menu on outside click ─── */
  useEffect(() => {
    if (!showQMenu) return;
    const fn = (e: MouseEvent): void => {
      if (qMenuRef.current && !qMenuRef.current.contains(e.target as Node))
        setShowQMenu(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [showQMenu]);

  /* ─── controls auto-hide ─── */
  const resetCtrl = useCallback((): void => {
    if (ctrlTimeout.current) clearTimeout(ctrlTimeout.current);
    setShowControls(true);
    if (isPlayingRef.current)
      ctrlTimeout.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  /* ─── player actions ─── */
  const togglePlay = useCallback((): void => {
    isPlaying ? videoRef.current?.pause() : videoRef.current?.play();
  }, [isPlaying]);

  const skip = useCallback((s: number): void => {
    if (videoRef.current) videoRef.current.currentTime += s;
  }, []);

  const toggleMute = useCallback((): void => {
    if (videoRef.current) { videoRef.current.muted = !isMuted; setIsMuted(!isMuted); }
  }, [isMuted]);

  const toggleFs = useCallback(async (): Promise<void> => {
    if (!containerRef.current) return;
    !isFullscreen
      ? await containerRef.current.requestFullscreen().catch(() => {})
      : await document.exitFullscreen().catch(() => {});
  }, [isFullscreen]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const t = parseFloat(e.target.value);
    if (videoRef.current) { videoRef.current.currentTime = t; setCurrentTime(t); }
  };

  const handleVol = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const v = parseFloat(e.target.value);
    if (videoRef.current) { videoRef.current.volume = v; setVolume(v); setIsMuted(v === 0); }
  };

  /* ─── quality change handler ─── */
  const handleQualitySelect = (q: "auto" | number): void => {
    setQuality(q);
    setShowQMenu(false);
  };

  /* ─── fullscreen listener ─── */
  useEffect(() => {
    const fn = (): void => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fn);
    return () => document.removeEventListener("fullscreenchange", fn);
  }, []);

  /* ─── keyboard shortcuts ─── */
  useEffect(() => {
    const fn = (e: KeyboardEvent): void => {
      if ([" ", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
      if      (e.key === " ")                  togglePlay();
      else if (e.key === "ArrowLeft")          skip(-10);
      else if (e.key === "ArrowRight")         skip(10);
      else if (e.key === "f" || e.key === "F") toggleFs();
      else if (e.key === "m" || e.key === "M") toggleMute();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [togglePlay, skip, toggleFs, toggleMute]);

  /* ─── HLS setup — re-runs when activeSrc changes ─── */
  useEffect(() => {
    if (!activeSrc || !videoRef.current) return;
    const video = videoRef.current;

    /* remember playback position so quality switch feels seamless */
    const resumeTime = currentTime > 0 ? currentTime : 0;

    type EventCleanup = () => void;
    const on = (n: string, fn: EventListener): EventCleanup => {
      video.addEventListener(n, fn);
      return () => video.removeEventListener(n, fn);
    };

    const cls: EventCleanup[] = [
      on("play", () => { isPlayingRef.current = true;  setIsPlaying(true);  resetCtrl(); }),
      on("pause",() => { isPlayingRef.current = false; setIsPlaying(false); resetCtrl(); }),
      on("timeupdate",     () => setCurrentTime(video.currentTime)),
      on("durationchange", () => setDuration(video.duration)),
      on("volumechange",   () => { setVolume(video.volume); setIsMuted(video.muted); }),
      on("progress", () => {
        if (video.buffered.length > 0 && video.duration > 0)
          setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
      }),
      on("canplay",   () => setVideoLoading(false)),
      on("waiting",   () => setVideoLoading(true)),
      on("playing",   () => setVideoLoading(false)),
      on("loadstart", () => setVideoLoading(true)),
    ];

    const loadVideo = (): void => {
      const Hls = getHls();
      if (Hls?.isSupported()) {
        hlsRef.current?.destroy();
        const hls = new Hls({ debug: false, enableWorker: true, maxBufferLength: 30 });
        hls.loadSource(activeSrc);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setVideoLoading(false);
          if (resumeTime > 0) video.currentTime = resumeTime;
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_: string, d: { fatal: boolean; type: string }) => {
          if (d.fatal) {
            if (d.type === Hls.ErrorTypes.NETWORK_ERROR) {
              if (isDub) { console.warn("Dub not available"); onVersionFallback?.(); }
              else hls.startLoad();
            } else if (d.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = activeSrc;
        if (resumeTime > 0) video.currentTime = resumeTime;
        video.load();
        video.play().catch(() => {});
      }
    };

    if (getHls()) loadVideo();
    else {
      const s = document.createElement("script");
      s.src   = "https://cdn.jsdelivr.net/npm/hls.js@1.4.12";
      s.async = true;
      s.onload = loadVideo;
      document.head.appendChild(s);
    }

    return () => {
      cls.forEach(c => c());
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSrc, isDub, onVersionFallback, resetCtrl]);

  /* ─── derived ─── */
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  /* ─── quality label shown on button ─── */
  const qualityLabel: string = quality === "auto"
    ? "AUTO"
    : resLabel(sorted[quality as number]?.RESOLUTION ?? "");

  /* ══════════════════════════════════════════════════════ RENDER */
  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black overflow-hidden cursor-pointer
                  ${isFullscreen ? "h-screen" : "aspect-video"}`}
      onMouseMove={resetCtrl}
      onTouchStart={resetCtrl}
    >
      <style>{PLAYER_STYLES}</style>

      {/* ── video element ── */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain z-[1]"
        onClick={togglePlay}
        onContextMenu={e => e.preventDefault()}
        crossOrigin="anonymous"
      />

      {/* ── loading spinner ── */}
      {videoLoading && (
        <div className="absolute inset-0 z-[10] flex items-center justify-center bg-black/65 backdrop-blur-sm">
          <div className="text-center">
            <div
              className="w-[52px] h-[52px] border-[3px] border-[#c01520]/30 border-t-[#c01520] rounded-full mx-auto mb-3"
              style={{ animation: "vp-spin .8s linear infinite" }}
            />
            <div className="text-[#eeeef5]/60 text-[14px] tracking-widest" style={BB}>
              {quality !== "auto" ? `Switching to ${qualityLabel}…` : "Initializing Stream…"}
            </div>
          </div>
        </div>
      )}

      {/* ── controls overlay ── */}
      <div
        className={`absolute inset-0 z-[7] transition-opacity duration-300
                    ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ background: "linear-gradient(to top,rgba(0,0,0,0.88) 0%,transparent 35%)" }}
      >
        {/* centre controls */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-7"
          onClick={e => e.stopPropagation()}
        >
          {showSkipButtons && (
            <button
              onClick={() => skip(-10)}
              className="w-[46px] h-[46px] rounded-full bg-black/55 border border-white/[0.12]
                         flex flex-col items-center justify-center gap-0.5
                         text-[#eeeef5]/70 hover:bg-[#c01520]/40 hover:border-[#ff2040] hover:text-white
                         transition-all cursor-pointer"
              style={{ backdropFilter: "blur(8px)" }}
            >
              <Ico.prev />
              <span className="text-[10px] leading-none tracking-wide" style={BB}>10</span>
            </button>
          )}

          <button
            onClick={togglePlay}
            className="w-[70px] h-[70px] rounded-full flex items-center justify-center
                       text-white border-none cursor-pointer hover:scale-[1.08] transition-transform"
            style={{
              background: "linear-gradient(135deg,#c01520,#8b0010)",
              animation: "vp-rpulse 2.5s ease-in-out infinite",
            }}
          >
            {isPlaying ? <Ico.pause /> : <Ico.play />}
          </button>

          {showSkipButtons && (
            <button
              onClick={() => skip(10)}
              className="w-[46px] h-[46px] rounded-full bg-black/55 border border-white/[0.12]
                         flex flex-col items-center justify-center gap-0.5
                         text-[#eeeef5]/70 hover:bg-[#c01520]/40 hover:border-[#ff2040] hover:text-white
                         transition-all cursor-pointer"
              style={{ backdropFilter: "blur(8px)" }}
            >
              <Ico.next />
              <span className="text-[10px] leading-none tracking-wide" style={BB}>10</span>
            </button>
          )}
        </div>

        {/* bottom controls */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 pb-3.5 pt-3"
          onClick={e => e.stopPropagation()}
        >
          {/* progress bar */}
          <div className="relative h-1 hover:h-[5px] bg-white/10 rounded-full mb-2.5 cursor-pointer transition-all group">
            <div
              className="absolute inset-y-0 left-0 bg-white/[0.18] rounded-full pointer-events-none"
              style={{ width: `${buffered}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full pointer-events-none"
              style={{ width: `${pct}%`, background: "linear-gradient(to right,#c01520,#ff2040)" }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white
                         border-2 border-[#ff2040] pointer-events-none
                         shadow-[0_0_8px_rgba(255,32,64,0.8)]
                         group-hover:scale-125 transition-transform"
              style={{ left: `calc(${pct}% - 6px)` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="vp-prog-range"
            />
          </div>

          {/* control row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="bg-transparent border-none cursor-pointer p-1 rounded
                           text-[#eeeef5]/50 hover:text-white transition-colors"
              >
                {isPlaying ? <Ico.pauseS /> : <Ico.playS />}
              </button>
              <button
                onClick={toggleMute}
                className="bg-transparent border-none cursor-pointer p-1 rounded
                           text-[#eeeef5]/50 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? <Ico.mute /> : <Ico.vol />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={handleVol}
                className="vp-vol-range"
                style={{
                  background: `linear-gradient(to right,#c01520 0%,#c01520 ${volume * 100}%,rgba(255,255,255,0.1) ${volume * 100}%,rgba(255,255,255,0.1) 100%)`,
                }}
              />
              <span
                className="text-[#eeeef5]/50 whitespace-nowrap text-[13px] tracking-wide"
                style={BB}
              >
                {fmtTime(currentTime)} / {fmtTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onPrev && (
                <button
                  onClick={onPrev}
                  className="bg-transparent border-none cursor-pointer p-1 rounded
                             text-[#eeeef5]/50 hover:text-white transition-colors"
                  title="Previous episode"
                >
                  <Ico.prev />
                </button>
              )}
              {onNext && (
                <button
                  onClick={onNext}
                  className="bg-transparent border-none cursor-pointer p-1 rounded
                             text-[#eeeef5]/50 hover:text-white transition-colors"
                  title="Next episode"
                >
                  <Ico.next />
                </button>
              )}
              <button
                className="bg-transparent border-none cursor-pointer p-1 rounded
                           text-[#eeeef5]/50 hover:text-white transition-colors"
              >
                <Ico.cc />
              </button>

              {/* ── quality selector ── */}
              {sorted.length > 0 && (
                <div className="relative" ref={qMenuRef}>
                  {/* popup menu — rendered above the button */}
                  {showQMenu && (
                    <div
                      className="vp-qpop absolute bottom-[calc(100%+8px)] right-0
                                 bg-[#0d0d1a]/95 border border-white/[0.1] rounded-lg
                                 overflow-hidden min-w-[110px] shadow-2xl"
                      style={{ backdropFilter: "blur(16px)" }}
                    >
                      <div
                        className="px-3 py-1.5 text-[9px] text-[#eeeef5]/25
                                   uppercase tracking-[0.18em] border-b border-white/[0.06]"
                        style={BB}
                      >
                        Quality
                      </div>

                      {/* Auto option */}
                      <button
                        onClick={() => handleQualitySelect("auto")}
                        className={`w-full text-left flex items-center justify-between
                                    px-3 py-2 text-[12px] cursor-pointer transition-all border-none
                                    ${quality === "auto"
                                      ? "text-[#ff2040] bg-[#c01520]/10"
                                      : "text-[#eeeef5]/60 bg-transparent hover:text-white hover:bg-white/[0.04]"}`}
                        style={BB}
                      >
                        <span>Auto</span>
                        {quality === "auto" && (
                          <svg width={10} height={10} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        )}
                      </button>

                      {/* Per-stream options */}
                      {sorted.map((s, i) => {
                        const label = resLabel(s.RESOLUTION);
                        const active = quality === i;
                        return (
                          <button
                            key={i}
                            onClick={() => handleQualitySelect(i)}
                            className={`w-full text-left flex items-center justify-between
                                        px-3 py-2 text-[12px] cursor-pointer transition-all border-none
                                        ${active
                                          ? "text-[#ff2040] bg-[#c01520]/10"
                                          : "text-[#eeeef5]/60 bg-transparent hover:text-white hover:bg-white/[0.04]"}`}
                            style={BB}
                          >
                            <span>{label}</span>
                            {active && (
                              <svg width={10} height={10} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* trigger button */}
                  <button
                    onClick={() => setShowQMenu(q => !q)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer
                                border transition-all text-[11px] font-bold tracking-widest
                                ${showQMenu
                                  ? "bg-[#c01520]/15 border-[#c01520]/40 text-[#ff2040]"
                                  : "bg-transparent border-transparent text-[#eeeef5]/50 hover:text-white"}`}
                    style={BB}
                    title="Quality settings"
                  >
                    <Ico.gear />
                    <span>{qualityLabel}</span>
                  </button>
                </div>
              )}

              <button
                onClick={toggleFs}
                className="bg-transparent border-none cursor-pointer p-1 rounded
                           text-[#eeeef5]/50 hover:text-white transition-colors"
              >
                {isFullscreen ? <Ico.exitFs /> : <Ico.fs />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}