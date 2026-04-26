"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

/* ─── helpers ─── */
const fmtTime = (t: number): string => {
  if (!t || isNaN(t)) return "0:00";
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
};

const BB: React.CSSProperties = { fontFamily: "'Bebas Neue', sans-serif" };
const storageKey = (s: string) => `vp_pos:${s}`;

/* ─── types ─── */
export interface QualityStream {
  url: string;
  BANDWIDTH?: string;
  RESOLUTION?: string;
  bandwidth?: number;
  resolution?: string;
  width?: number;
  height?: number;
  frameRate?: number;
  quality?: string;
}
export interface AudioStream {
  url: string; type?: string; name?: string;
  language?: string; groupId?: string; default?: boolean;
}
export interface VideoPlayerProps {
  src: string;
  streams?: QualityStream[];
  audio?: AudioStream[];
  subtitles?: string[];
  onVersionFallback?: () => void;
  isDub?: boolean;
  showSkipButtons?: boolean;
}

/* ─── stream helpers ─── */
const getBw     = (s: QualityStream) => s.bandwidth ?? parseInt(s.BANDWIDTH ?? "0", 10);
const sortedStr = (arr: QualityStream[]) => [...arr].sort((a, b) => getBw(b) - getBw(a));
const getLabel  = (s: QualityStream): string => {
  if (s.quality) return s.quality;
  const h = s.height ?? parseInt((s.resolution ?? s.RESOLUTION ?? "").split("x")[1] ?? "0", 10);
  if (!h) return "?";
  if (h >= 2160) return "4K";
  if (h >= 1440) return "1440p";
  if (h >= 1080) return "1080p";
  if (h >= 720)  return "720p";
  if (h >= 480)  return "480p";
  if (h >= 360)  return "360p";
  return `${h}p`;
};

/* ─── icons ─── */
const I = {
  play:   () => <svg width={26} height={26} fill="currentColor" viewBox="0 0 24 24" style={{marginLeft:3}}><path d="M8 5v14l11-7z"/></svg>,
  pause:  () => <svg width={26} height={26} fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>,
  playS:  () => <svg width={20} height={20} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>,
  pauseS: () => <svg width={20} height={20} fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>,
  prev:   () => <svg width={18} height={18} fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>,
  next:   () => <svg width={18} height={18} fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 3.9V8.1L8.5 12zm7-6h2v12h-2z"/></svg>,
  vol:    () => <svg width={18} height={18} fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>,
  mute:   () => <svg width={18} height={18} fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>,
  fs:     () => <svg width={17} height={17} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>,
  exitFs: () => <svg width={17} height={17} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"/></svg>,
  cc:     () => <svg width={17} height={17} fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 11H5v-2h7v2zm7 0h-2v-2h2v2zm0-4H5V9h14v2z"/></svg>,
  gear:   () => <svg width={17} height={17} fill="currentColor" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  music:  () => <svg width={12} height={12} fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>,
  check:  () => <svg width={10} height={10} fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>,
};

const CSS = `
  .vp-seek{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;margin:0}
  .vp-vol{-webkit-appearance:none;width:68px;height:3px;border-radius:2px;outline:none;cursor:pointer}
  .vp-vol::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:10px;border-radius:50%;background:#fff;cursor:pointer}
  @keyframes vp-spin{to{transform:rotate(360deg)}}
  @keyframes vp-pulse{0%,100%{box-shadow:0 0 24px rgba(192,21,32,.6),0 0 0 0 rgba(192,21,32,.3)}50%{box-shadow:0 0 40px rgba(192,21,32,.8),0 0 0 12px rgba(192,21,32,0)}}
  @keyframes vp-pop{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .vp-pop{animation:vp-pop .15s ease forwards}
  video::cue{background:rgba(0,0,0,.78);color:#fff;font-size:1em;line-height:1.4;padding:2px 6px}
`;

/* ════════════════════════════════════════════════════════════════ */
export default function VideoPlayer({
  src,
  streams         = [],
  audio           = [],
  subtitles       = [],
  onVersionFallback,
  isDub           = false,
  showSkipButtons = true,
}: VideoPlayerProps): React.ReactElement {

  const [playing,    setPlaying]    = useState(false);
  const [curTime,    setCurTime]    = useState(0);
  const [duration,   setDuration]   = useState(0);
  const [volume,     setVolume]     = useState(1);
  const [muted,      setMuted]      = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showCtrl,   setShowCtrl]   = useState(true);
  const [buffered,   setBuffered]   = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [quality,    setQuality]    = useState<"auto" | number>("auto");
  const [showQMenu,  setShowQMenu]  = useState(false);
  const [showCC,     setShowCC]     = useState(subtitles.length > 0);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const hlsRef    = useRef<any>(null);   // eslint-disable-line
  const levelsRef = useRef<any[]>([]);   // eslint-disable-line
  const ctrlTmr   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadTmr   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playingR  = useRef(false);
  const qualityR  = useRef<"auto" | number>("auto");
  const qMenuRef  = useRef<HTMLDivElement>(null);
  const sorted    = sortedStr(streams);

  useEffect(() => { qualityR.current = quality; }, [quality]);
  useEffect(() => { if (subtitles.length > 0) setShowCC(true); }, [subtitles.length]);

  /* controls auto-hide */
  const resetCtrl = useCallback(() => {
    if (ctrlTmr.current) clearTimeout(ctrlTmr.current);
    setShowCtrl(true);
    if (playingR.current)
      ctrlTmr.current = setTimeout(() => setShowCtrl(false), 3000);
  }, []);

  /* quality menu close */
  useEffect(() => {
    if (!showQMenu) return;
    const fn = (e: MouseEvent) => {
      if (qMenuRef.current && !qMenuRef.current.contains(e.target as Node)) setShowQMenu(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [showQMenu]);

  /* fullscreen sync */
  useEffect(() => {
    const fn = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fn);
    return () => document.removeEventListener("fullscreenchange", fn);
  }, []);

  /* CC sync */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const apply = () => {
      for (let i = 0; i < v.textTracks.length; i++)
        v.textTracks[i].mode = showCC && i === 0 ? "showing" : "hidden";
    };
    apply(); const t = setTimeout(apply, 300); return () => clearTimeout(t);
  }, [showCC, subtitles]);

  /* keyboard */
  const togglePlay = useCallback(() => { playingR.current ? videoRef.current?.pause() : videoRef.current?.play(); }, []);
  const skip       = useCallback((s: number) => { if (videoRef.current) videoRef.current.currentTime += s; }, []);
  const toggleMute = useCallback(() => { if (!videoRef.current) return; videoRef.current.muted = !muted; setMuted(!muted); }, [muted]);
  const toggleFs = useCallback(async () => {
    if (!wrapRef.current) return;
    if (!fullscreen) {
      await wrapRef.current.requestFullscreen().catch(() => {});
      try {
        const orientation = screen.orientation as ScreenOrientation & {
          lock: (orientation: "landscape" | "portrait" | "landscape-primary" | "landscape-secondary" | "portrait-primary" | "portrait-secondary" | "natural" | "any") => Promise<void>;
        };
        await orientation.lock("landscape");
      } catch { /* not supported on this browser */ }
    } else {
      await document.exitFullscreen().catch(() => {});
      try { screen.orientation.unlock(); } catch { /* noop */ }
    }
  }, [fullscreen]);

  useEffect(() => {
    const fn = () => {
      const isFs = !!document.fullscreenElement;
      setFullscreen(isFs);
      if (!isFs) {
        try { screen.orientation.unlock(); } catch { /* noop */ }
      }
    };
    document.addEventListener("fullscreenchange", fn);
    return () => document.removeEventListener("fullscreenchange", fn);
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ([" ", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
      if      (e.key === " ")                  togglePlay();
      else if (e.key === "ArrowLeft")          skip(-10);
      else if (e.key === "ArrowRight")         skip(10);
      else if (e.key === "f" || e.key === "F") toggleFs();
      else if (e.key === "m" || e.key === "M") toggleMute();
      else if ((e.key === "c" || e.key === "C") && subtitles.length > 0) setShowCC(c => !c);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [togglePlay, skip, toggleFs, toggleMute, subtitles]);

  /* quality apply */
  const applyQuality = useCallback((q: "auto" | number) => {
    const hls = hlsRef.current;
    if (!hls) return;
    if (q === "auto") { hls.currentLevel = -1; hls.loadLevel = -1; return; }
    const stream = sorted[q as number];
    if (!stream) return;
    let idx = levelsRef.current.findIndex((l: any) =>   // eslint-disable-line
      Array.isArray(l.url) ? l.url.includes(stream.url) : l.url === stream.url
    );
    if (idx < 0 && stream.height)
      idx = levelsRef.current.findIndex((l: any) => l.height === stream.height); // eslint-disable-line
    if (idx >= 0) { hls.currentLevel = idx; hls.loadLevel = idx; }
  }, [sorted]);

  /* ══════════════════════════════════════════════════════════════
   *  HLS SETUP  —  dynamic import (no script tags)
   * ══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!src || !videoRef.current) return;
    const video = videoRef.current;
    let gone    = false;

    console.log("[VP] src →", src);

    setLoading(true);
    setError(null);
    setPlaying(false);
    playingR.current = false;

    /* 12-second watchdog */
    if (loadTmr.current) clearTimeout(loadTmr.current);
    loadTmr.current = setTimeout(() => {
      if (gone) return;
      console.error("[VP] 12 s timeout — stream URL may be unreachable or blocked by CORS.\nURL:", src);
      setError("Stream timed out. Open DevTools → Network to inspect the URL.");
      setLoading(false);
    }, 12_000);

    const clearWatchdog = () => {
      if (loadTmr.current) { clearTimeout(loadTmr.current); loadTmr.current = null; }
    };

    type Off = () => void;
    const on = (ev: string, fn: EventListener): Off => {
      video.addEventListener(ev, fn); return () => video.removeEventListener(ev, fn);
    };

    const offs: Off[] = [
      on("playing",       () => { clearWatchdog(); setLoading(false); setError(null); }),
      on("canplay",       () => { clearWatchdog(); setLoading(false); }),
      on("waiting",       () => setLoading(true)),
      on("loadstart",     () => setLoading(true)),
      on("play",          () => { playingR.current = true;  setPlaying(true);  resetCtrl(); }),
      on("pause",         () => { playingR.current = false; setPlaying(false); resetCtrl(); }),
      on("durationchange",() => setDuration(video.duration)),
      on("volumechange",  () => { setVolume(video.volume); setMuted(video.muted); }),
      on("timeupdate",    () => {
        setCurTime(video.currentTime);
        try {
          if (Math.floor(video.currentTime) % 5 === 0)
            localStorage.setItem(storageKey(src), String(video.currentTime));
        } catch { /* noop */ }
      }),
      on("progress", () => {
        if (video.buffered.length && video.duration)
          setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
      }),
      on("ended", () => { try { localStorage.removeItem(storageKey(src)); } catch { /* noop */ } }),
    ];

    let resumeTime = 0;
    try { resumeTime = parseFloat(localStorage.getItem(storageKey(src)) ?? "0") || 0; } catch { /* noop */ }

    let recoveries = 0;

    (async () => {
      if (gone) return;

      /* ── Safari native HLS ── */
      if (!("MediaSource" in window) && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        if (resumeTime) video.currentTime = resumeTime;
        video.load();
        video.play().catch(() => {});
        return;
      }

      /* ── Dynamic import hls.js ── */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let Hls: any;
      try {
        Hls = (await import("hls.js")).default;
      } catch (err) {
        console.error("[VP] hls.js import failed:", err);
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src; video.load(); video.play().catch(() => {});
        } else {
          clearWatchdog();
          setError("Could not load HLS library. Make sure hls.js is installed: npm i hls.js");
          setLoading(false);
        }
        return;
      }

      if (gone) return;

      if (!Hls.isSupported()) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src; if (resumeTime) video.currentTime = resumeTime;
          video.load(); video.play().catch(() => {});
        } else {
          clearWatchdog();
          setError("HLS is not supported in this browser.");
          setLoading(false);
        }
        return;
      }

      /* ── HLS.js ── */
      hlsRef.current?.destroy();
      levelsRef.current = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hls = new Hls({
        debug:                       false,
        enableWorker:                true,
        startLevel:                  -1,
        maxBufferLength:             20,
        maxMaxBufferLength:          60,
        maxBufferSize:               30_000_000,
        maxBufferHole:               0.5,
        manifestLoadingMaxRetry:     4,
        manifestLoadingRetryDelay:   1000,
        levelLoadingMaxRetry:        4,
        levelLoadingRetryDelay:      500,
        fragLoadingMaxRetry:         6,
        fragLoadingRetryDelay:       500,
        fragLoadingMaxRetryTimeout:  10_000,
        nudgeOffset:                 0.2,
        nudgeMaxRetry:               5,
        highBufferWatchdogPeriod:    2,
        xhrSetup: (xhr: XMLHttpRequest) => { xhr.withCredentials = false; },
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hls.on(Hls.Events.MANIFEST_PARSED, (_: string, data: any) => {
        if (gone) return;
        console.log("[VP] manifest parsed →", data.levels.length, "levels");
        levelsRef.current = data.levels;
        if (qualityR.current !== "auto") applyQuality(qualityR.current);
        if (resumeTime) video.currentTime = resumeTime;
        video.play().catch((e: unknown) => console.warn("[VP] play blocked:", e));
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hls.on(Hls.Events.ERROR, (_: string, d: any) => {
        console.warn("[VP] HLS error:", d.type, d.details, "fatal:", d.fatal, "response:", d.response?.code);
        if (!d.fatal) return;

        if (d.type === Hls.ErrorTypes.NETWORK_ERROR) {
          if (recoveries < 3) {
            recoveries++;
            console.warn(`[VP] retrying… (${recoveries}/3)`);
            setTimeout(() => hls.startLoad(), 1000 * recoveries);
          } else {
            clearWatchdog();
            if (isDub) { onVersionFallback?.(); }
            setError("Network error loading stream. Try another server.");
            setLoading(false);
          }
        } else if (d.type === Hls.ErrorTypes.MEDIA_ERROR) {
          if (recoveries < 3) { recoveries++; hls.recoverMediaError(); }
          else { clearWatchdog(); setError("Media decode error. Try another server."); setLoading(false); }
        } else {
          clearWatchdog(); setError("Fatal stream error. Try another server."); setLoading(false); hls.destroy();
        }
      });
    })();

    return () => {
      gone = true;
      clearWatchdog();
      offs.forEach(f => f());
      hlsRef.current?.destroy();
      hlsRef.current  = null;
      levelsRef.current = [];
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  /* ── handlers ── */
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    if (videoRef.current) { videoRef.current.currentTime = t; setCurTime(t); }
  };
  const handleVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (videoRef.current) { videoRef.current.volume = v; setVolume(v); setMuted(v === 0); }
  };
  const pickQuality = (q: "auto" | number) => { setQuality(q); setShowQMenu(false); applyQuality(q); };
  const retry = useCallback(() => {
    setError(null); setLoading(true);
    if (hlsRef.current) { hlsRef.current.loadSource(src); hlsRef.current.startLoad(); }
    else videoRef.current?.load();
  }, [src]);

  const pct      = duration > 0 ? (curTime / duration) * 100 : 0;
  const qLabel   = quality === "auto" ? "AUTO" : getLabel(sorted[quality as number] ?? {});
  const defAudio = audio.find(a => a.default) ?? audio[0];

  /* ══════════════════════════════════════ RENDER ══════════════════ */
  return (
    <div
      ref={wrapRef}
      className={`relative w-full bg-black overflow-hidden select-none
                  ${fullscreen ? "h-screen" : "aspect-video"}`}
      onMouseMove={resetCtrl}
      onTouchStart={resetCtrl}
    >
      <style>{CSS}</style>

      {/* video element */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain z-[1]"
        onClick={togglePlay}
        onContextMenu={e => e.preventDefault()}
        crossOrigin="anonymous"
        playsInline
      >
        {subtitles[0] && (
          <track key={subtitles[0]} kind="subtitles" src={subtitles[0]} srcLang="ja" label="Japanese" />
        )}
      </video>

      {/* loading / error overlay */}
      {(loading || error) && (
        <div className="absolute inset-0 z-[10] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center px-8 max-w-sm">
            {error ? (
              <>
                <p className="text-[#ff6b6b] text-[13px] leading-snug mb-4" style={BB}>{error}</p>
                <button onClick={retry}
                        className="text-[11px] tracking-widest px-5 py-2 rounded border border-[#c01520]/50
                                   text-[#ff6b6b] hover:bg-[#c01520]/20 transition-colors cursor-pointer bg-transparent">
                  RETRY
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 border-[3px] border-[#c01520]/25 border-t-[#c01520]
                                rounded-full mx-auto mb-3"
                     style={{ animation: "vp-spin .8s linear infinite" }} />
                <p className="text-white/40 text-[13px] tracking-widest" style={BB}>
                  {quality !== "auto" ? `Switching to ${qLabel}…` : "Loading stream…"}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* controls overlay */}
      <div className={`absolute inset-0 z-[7] transition-opacity duration-300
                       ${showCtrl ? "opacity-100" : "opacity-0 pointer-events-none"}`}
           style={{ background: "linear-gradient(to top,rgba(0,0,0,.9) 0%,transparent 40%)" }}>

        {/* centre */}
        <div className="absolute inset-0 flex items-center justify-center gap-6"
             onClick={e => e.stopPropagation()}>
          {showSkipButtons && (
            <button onClick={() => skip(-10)}
                    className="w-11 h-11 rounded-full bg-black/50 border border-white/10 flex flex-col items-center
                               justify-center gap-0.5 text-white/60 hover:bg-[#c01520]/40 hover:border-[#ff2040]
                               hover:text-white transition-all cursor-pointer"
                    style={{ backdropFilter: "blur(8px)" }}>
              <I.prev /><span className="text-[9px]" style={BB}>10</span>
            </button>
          )}
          <button onClick={togglePlay}
                  className="w-[68px] h-[68px] rounded-full flex items-center justify-center text-white
                             cursor-pointer hover:scale-110 transition-transform border-none"
                  style={{ background: "linear-gradient(135deg,#c01520,#8b0010)", animation: "vp-pulse 2.5s ease-in-out infinite" }}>
            {playing ? <I.pause /> : <I.play />}
          </button>
          {showSkipButtons && (
            <button onClick={() => skip(10)}
                    className="w-11 h-11 rounded-full bg-black/50 border border-white/10 flex flex-col items-center
                               justify-center gap-0.5 text-white/60 hover:bg-[#c01520]/40 hover:border-[#ff2040]
                               hover:text-white transition-all cursor-pointer"
                    style={{ backdropFilter: "blur(8px)" }}>
              <I.next /><span className="text-[9px]" style={BB}>10</span>
            </button>
          )}
        </div>

        {/* bottom bar */}
        <div className="absolute bottom-0 inset-x-0 px-4 pb-4 pt-2"
             onClick={e => e.stopPropagation()}>

          {/* progress bar */}
          <div className="relative h-[3px] hover:h-[5px] bg-white/10 rounded-full mb-3 cursor-pointer transition-all group">
            <div className="absolute inset-y-0 left-0 bg-white/20 rounded-full pointer-events-none"
                 style={{ width: `${buffered}%` }} />
            <div className="absolute inset-y-0 left-0 rounded-full pointer-events-none"
                 style={{ width: `${pct}%`, background: "linear-gradient(to right,#c01520,#ff2040)" }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#ff2040]
                            pointer-events-none shadow-[0_0_8px_rgba(255,32,64,.8)] group-hover:scale-125 transition-transform"
                 style={{ left: `calc(${pct}% - 6px)` }} />
            <input type="range" min={0} max={duration || 100} step={0.1} value={curTime}
                   onChange={handleSeek} className="vp-seek" />
          </div>

          {/* row */}
          <div className="flex items-center justify-between gap-3">
            {/* left */}
            <div className="flex items-center gap-1.5">
              <button onClick={togglePlay} className="p-1 rounded text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none">
                {playing ? <I.pauseS /> : <I.playS />}
              </button>
              <button onClick={toggleMute} className="p-1 rounded text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none">
                {muted || volume === 0 ? <I.mute /> : <I.vol />}
              </button>
              <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
                     onChange={handleVol} className="vp-vol"
                     style={{ background: `linear-gradient(to right,#c01520 ${(muted?0:volume)*100}%,rgba(255,255,255,.1) ${(muted?0:volume)*100}%)` }} />
              <span className="text-white/40 text-[12px] whitespace-nowrap" style={BB}>
                {fmtTime(curTime)} / {fmtTime(duration)}
              </span>
            </div>

            {/* right */}
            <div className="flex items-center gap-1.5">
              {/* CC toggle */}
              <button
                onClick={() => subtitles.length > 0 && setShowCC(c => !c)}
                className={`p-1 rounded transition-colors cursor-pointer bg-transparent border-none
                            ${subtitles.length === 0 ? "text-white/15 cursor-not-allowed"
                              : showCC ? "text-[#ff2040]" : "text-white/50 hover:text-white"}`}>
                <I.cc />
              </button>

              {/* quality picker */}
              {sorted.length > 0 && (
                <div className="relative" ref={qMenuRef}>
                  {showQMenu && (
                    <div className="vp-pop absolute bottom-[calc(100%+8px)] right-0 min-w-[130px]
                                   bg-[#0d0d1a]/95 border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                         style={{ backdropFilter: "blur(20px)" }}>
                      <p className="px-3 py-1.5 text-[9px] text-white/25 uppercase tracking-[.2em] border-b border-white/[.06]" style={BB}>
                        Quality
                      </p>
                      {defAudio && (
                        <div className="px-3 py-1.5 flex items-center gap-1.5 border-b border-white/[.05] bg-white/[.02]">
                          <I.music />
                          <span className="text-[10px] text-white/35" style={BB}>{defAudio.name ?? defAudio.language ?? "Audio"}</span>
                          <span className="ml-auto text-[8px] text-[#c01520]/60" style={BB}>AUTO</span>
                        </div>
                      )}
                      <button onClick={() => pickQuality("auto")}
                              className={`w-full flex items-center justify-between px-3 py-2 text-[12px] cursor-pointer border-none transition-all
                                          ${quality === "auto" ? "text-[#ff2040] bg-[#c01520]/10" : "text-white/55 bg-transparent hover:text-white hover:bg-white/[.04]"}`}
                              style={BB}>
                        Auto {quality === "auto" && <I.check />}
                      </button>
                      {sorted.map((s, i) => (
                        <button key={i} onClick={() => pickQuality(i)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-[12px] cursor-pointer border-none transition-all
                                            ${quality === i ? "text-[#ff2040] bg-[#c01520]/10" : "text-white/55 bg-transparent hover:text-white hover:bg-white/[.04]"}`}
                                style={BB}>
                          <span className="flex items-center gap-1.5">
                            {getLabel(s)}
                            {s.frameRate && <span className="text-[9px] opacity-40">{Math.round(s.frameRate)}fps</span>}
                          </span>
                          {quality === i && <I.check />}
                        </button>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setShowQMenu(q => !q)}
                          className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer border text-[11px] tracking-widest transition-all bg-transparent
                                      ${showQMenu ? "border-[#c01520]/50 text-[#ff2040] bg-[#c01520]/10" : "border-transparent text-white/50 hover:text-white"}`}
                          style={BB}>
                    <I.gear /><span>{qLabel}</span>
                  </button>
                </div>
              )}

              <button onClick={toggleFs} className="p-1 rounded text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none">
                {fullscreen ? <I.exitFs /> : <I.fs />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}