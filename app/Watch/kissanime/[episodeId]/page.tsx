"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import VideoPlayer, { QualityStream } from "@/components/videoplayer";

/* ─── kissanime source API types ─── */
interface KissAnimeVideoStream {
  url: string;
  bandwidth: number;
  resolution: string;
  width: number;
  height: number;
  frameRate: number;
  codecs: string;
  audioGroup: string;
}

interface KissAnimeAudioStream {
  url: string;
  type: string;
  name: string;
  language: string;
  groupId: string;
  default: boolean;
}

interface KissAnimeResult {
  source: string;
  playerUrl: string;
  m3u8: string[];
  audio: KissAnimeAudioStream[];
  video: KissAnimeVideoStream[];
  subtitles: {
    vtt: string[];
    srt: string[];
  };
}

interface ApiWatchResponse {
  episodeId: string;
  anilistId: number | null;
  m3u8: string[];
  audio: KissAnimeAudioStream[];
  video: KissAnimeVideoStream[];
  results: KissAnimeResult[];
}

/* ─── kissanime episodes API types ─── */
interface EpisodeThumbnail {
  formats: string[];
  sm: string;
  aspectRatio: number;
  hq: string;
}

interface KissAnimeEpisode {
  slug: string;
  episode_number: number;
  episode_string: string;
  thumbnail: EpisodeThumbnail | null;
  episodeId: string;
}

interface SubDubOption {
  value: string;
  label: string;
}

interface ApiEpisodesResponse {
  showSlug: string;
  page: number;
  language: string;
  subDub: SubDubOption[];
  totalEps: number | null;
  pageRanges: number[];
  episodes: KissAnimeEpisode[];
}

/* ─── tiny helpers ─── */
const fmtDate = (d?: string): string => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
};

const upsertMeta = (
  selector: string,
  attrKey: "name" | "property",
  attrVal: string,
  content: string
): void => {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) { el = document.createElement("meta"); document.head.appendChild(el); }
  el.setAttribute(attrKey, attrVal);
  el.setAttribute("content", content);
};

/* Build thumbnail URL from kissanime thumbnail object */
const buildThumbUrl = (thumb: EpisodeThumbnail | null, quality: "sm" | "hq" = "sm"): string => {
  if (!thumb) return "";
  const path = quality === "hq" ? thumb.hq : thumb.sm;
  const fmt  = thumb.formats?.[0] ?? "jpeg";
  return `https://image.tmdb.org/t/p/original/${path}.${fmt}`;
};

/* Format slug to readable title */
const slugToTitle = (slug: string): string =>
  slug
    .replace(/-[a-f0-9]{4,}$/i, "")   // strip trailing hash
    .replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());

/* Extract show slug from episodeId  e.g. "kirio-fanclub-b47b/ep-4-0bff14" → "kirio-fanclub-b47b" */
const slugFromEpisodeId = (id: string): string => id.split("/")[0] ?? id;

/* Detect dub slug */
const isDubSlug = (slug: string): boolean => slug.endsWith("-dub");

/* Toggle dub suffix on slug */
const toggleDubSlug = (slug: string, dub: boolean): string => {
  if (dub && !isDubSlug(slug)) return `${slug}-dub`;
  if (!dub && isDubSlug(slug))  return slug.slice(0, -4);
  return slug;
};

/* ─── font shorthands ─── */
const BB: React.CSSProperties = { fontFamily: "'Bebas Neue', sans-serif" };
const RJ: React.CSSProperties = { fontFamily: "'Rajdhani', sans-serif" };
const DM: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

/* ─── minimal styles ─── */
const MIN_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap');
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#c0152090;border-radius:2px}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes npb0{from{height:8px}to{height:16px}}
  @keyframes npb1{from{height:14px}to{height:6px}}
  @keyframes npb2{from{height:10px}to{height:18px}}
  @keyframes npb3{from{height:16px}to{height:8px}}
  @keyframes npb4{from{height:6px}to{height:14px}}
`;

/* ─── icons ─── */
const Ico = {
  chevR: (): React.ReactElement => (
    <svg width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
    </svg>
  ),
  chevL: (): React.ReactElement => (
    <svg width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
    </svg>
  ),
  play: (): React.ReactElement => (
    <svg width={10} height={10} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
  ),
};

/* ─── map kissanime video streams → QualityStream[] ─── */
function mapVideoToQualityStreams(video: KissAnimeVideoStream[]): QualityStream[] {
  return video.map(v => ({
    url:       v.url,
    quality:   v.resolution,
    bandwidth: v.bandwidth,
    width:     v.width,
    height:    v.height,
  }));
}

const API_KEY = "fuckyoubitch";
const BASE    = "https://sad-ebon-nine.vercel.app/anime/kissanime";

/* ══════════════════════════════════════════════════════════════════ */
export default function AnimeKaiPlayer(): React.ReactElement {

  /* ─── url params ─── */
  const [episodeId, setEpisodeId] = useState<string>("");

  /* ─── video source ─── */
  const [m3u8Url,       setM3u8Url]       = useState<string>("");
  const [qualityStreams, setQualityStreams] = useState<QualityStream[]>([]);
  const [subtitles,     setSubtitles]     = useState<string[]>([]);
  const [loading,       setLoading]       = useState<boolean>(false);
  const [error,         setError]         = useState<string | null>(null);

  /* ─── episodes list ─── */
  const [episodes,        setEpisodes]        = useState<KissAnimeEpisode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState<boolean>(false);
  const [subDubOptions,   setSubDubOptions]   = useState<SubDubOption[]>([]);
  const [currentPage,     setCurrentPage]     = useState<number>(1);
  const [totalEps,        setTotalEps]        = useState<number | null>(null);
  const [pageRanges,      setPageRanges]      = useState<number[]>([]);

  /* ─── derived from slug ─── */
  const [showSlug,    setShowSlug]    = useState<string>("");
  const [animeTitle,  setAnimeTitle]  = useState<string>("");
  const [version,     setVersion]     = useState<"sub" | "dub">("sub");

  /* ─── ui ─── */
  const [tab,         setTab]         = useState<"episodes" | "info">("episodes");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPlaying,   setIsPlaying]   = useState<boolean>(false);

  const listRef = useRef<HTMLDivElement>(null);

  /* ─── extract episodeId from url path ─── */
  useEffect(() => {
    const parts = window.location.pathname.split("/");
    const raw   = decodeURIComponent(parts[parts.length - 1] || "");
    setEpisodeId(raw);
  }, []);

  /* ─── derive slug + version whenever episodeId changes ─── */
  useEffect(() => {
    if (!episodeId) return;
    const slug = slugFromEpisodeId(episodeId);
    setShowSlug(slug);
    setVersion(isDubSlug(slug) ? "dub" : "sub");
    setAnimeTitle(slugToTitle(slug));
  }, [episodeId]);

  /* ─── fetch video source ─── */
  useEffect(() => {
    if (!episodeId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setQualityStreams([]);

        const res = await fetch(`${BASE}/source/${episodeId}?apiKey=${API_KEY}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d: ApiWatchResponse = await res.json();

        if (Array.isArray(d.m3u8) && d.m3u8.length > 0) {
          setM3u8Url(d.m3u8[0]);
        } else {
          throw new Error("No source URL returned");
        }

        if (Array.isArray(d.video) && d.video.length > 0) {
          setQualityStreams(mapVideoToQualityStreams(d.video));
        }

        const vttSubs = d.results?.[0]?.subtitles?.vtt ?? [];
        setSubtitles(vttSubs.filter((u: string) => !u.includes("preview-")));

      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load video");
      } finally {
        setLoading(false);
      }
    })();
  }, [episodeId]);

  /* ─── fetch episodes list ─── */
  useEffect(() => {
    if (!showSlug) return;
    (async () => {
      try {
        setLoadingEpisodes(true);
        const res = await fetch(
          `${BASE}/episodes/${showSlug}?page=${currentPage}&apiKey=${API_KEY}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiEpisodesResponse = await res.json();

        setEpisodes(json.episodes ?? []);
        setSubDubOptions(json.subDub ?? []);
        setTotalEps(json.totalEps);
        setPageRanges(json.pageRanges ?? []);
      } catch (e) {
        console.error("episodes fetch error:", e);
      } finally {
        setLoadingEpisodes(false);
      }
    })();
  }, [showSlug, currentPage]);

  /* ─── version change ─── */
  const handleVersionChange = useCallback((v: "sub" | "dub"): void => {
    if (v === version) return;
    setVersion(v);
    setEpisodeId(prevId => {
      const slug    = slugFromEpisodeId(prevId);
      const epPart  = prevId.split("/").slice(1).join("/");
      const newSlug = toggleDubSlug(slug, v === "dub");
      const newId   = epPart ? `${newSlug}/${epPart}` : newSlug;
      const base    = window.location.pathname.split("/").slice(0, -1).join("/");
      const params  = new URLSearchParams(window.location.search);
      window.history.pushState({}, "", `${base}/${encodeURIComponent(newId)}?${params}`);
      return newId;
    });
    // also refetch episodes under new slug
    setShowSlug(prev => toggleDubSlug(prev, v === "dub"));
  }, [version]);

  /* ─── episode navigation ─── */
  const handleEpisodeChange = useCallback((newId: string): void => {
    const base   = window.location.pathname.split("/").slice(0, -1).join("/");
    const params = new URLSearchParams(window.location.search);
    window.history.pushState({}, "", `${base}/${encodeURIComponent(newId)}?${params}`);
    setEpisodeId(newId);
    setVersion(isDubSlug(slugFromEpisodeId(newId)) ? "dub" : "sub");
  }, []);

  /* ─── derived values ─── */
  const currentIdx = episodes.findIndex(ep => ep.episodeId === episodeId);
  const currentEp  = episodes[currentIdx] ?? null;
  const prevEp     = currentIdx > 0 ? episodes[currentIdx - 1] : null;
  const nextEp     = currentIdx < episodes.length - 1 ? episodes[currentIdx + 1] : null;

  const filteredEpisodes = episodes.filter(ep => {
    if (!searchQuery) return true;
    return (
      ep.episode_string.includes(searchQuery) ||
      ep.episodeId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const NP_H = [8, 14, 10, 16, 6] as const;

  const handlePrev = useCallback((): void => {
    if (prevEp) handleEpisodeChange(prevEp.episodeId);
  }, [prevEp, handleEpisodeChange]);

  const handleNext = useCallback((): void => {
    if (nextEp) handleEpisodeChange(nextEp.episodeId);
  }, [nextEp, handleEpisodeChange]);

  const handleVersionFallback = useCallback((): void => {
    handleVersionChange("sub");
  }, [handleVersionChange]);

  /* ─── SEO ─── */
  useEffect(() => {
    if (!animeTitle || !currentEp) return;
    const pageTitle = `Episode ${currentEp.episode_number} - ${animeTitle}`;
    document.title  = pageTitle;
    upsertMeta('meta[property="og:title"]', "property", "og:title", pageTitle);
    const thumb = buildThumbUrl(currentEp.thumbnail, "hq");
    if (thumb) {
      upsertMeta('meta[property="og:image"]', "property", "og:image", thumb);
    }
    return () => { document.title = "Watch Anime"; };
  }, [animeTitle, currentEp]);

  /* ─── scroll active ep into view ─── */
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>("[data-active='true']")
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [episodeId]);

  /* ─── shared back button ─── */
  const BackBtn = (): React.ReactElement => (
    <button
      onClick={() => window.history.back()}
      className="inline-flex items-center gap-2 bg-[#c01520] hover:bg-[#e01828]
                 text-white text-[11px] font-bold tracking-widest uppercase
                 px-6 py-2.5 rounded transition-all cursor-pointer border-none"
      style={RJ}
    >
      <Ico.chevL /> Go Back
    </button>
  );

  /* ─── early returns ─── */
  if (!episodeId) return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-6">
      <style>{MIN_STYLES}</style>
      <div className="text-center">
        <div className="text-6xl mb-5">📺</div>
        <div className="text-3xl text-[#eeeef5] mb-2" style={BB}>No Episode Selected</div>
        <p className="text-[#eeeef5]/40 mb-6 text-sm" style={DM}>Please select an episode to start watching</p>
        <BackBtn />
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center gap-4">
      <style>{MIN_STYLES}</style>
      <div className="w-16 h-16 border-4 border-[#c01520]/25 border-t-[#c01520] rounded-full"
           style={{ animation: "spin .8s linear infinite" }} />
      <div className="text-[#eeeef5]/40 text-sm tracking-widest" style={BB}>Loading Stream…</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-6">
      <style>{MIN_STYLES}</style>
      <div className="text-center">
        <div className="text-6xl mb-5">⚠️</div>
        <div className="text-3xl text-[#eeeef5] mb-2" style={BB}>Stream Error</div>
        <p className="text-red-400/80 mb-6 text-sm" style={DM}>{error}</p>
        <BackBtn />
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════ MAIN RENDER */
  return (
    <div className="min-h-screen bg-[#080810] text-[#eeeef5]" style={RJ}>
      <style>{MIN_STYLES}</style>

      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-[100] h-[50px] flex items-center gap-2 sm:gap-3.5 px-3 sm:px-4
                      bg-[#080810]/92 backdrop-blur-2xl border-b border-[#c01520]/15">

        <div className="w-px h-4 bg-white/[0.07] flex-shrink-0" />

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

          {/* quality badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded
                          bg-white/[0.04] border border-white/[0.08]">
            <div className="w-[5px] h-[5px] rounded-full bg-[#ff2040]"
                 style={{ animation: "blink 2s ease-in-out infinite" }} />
            <span className="text-[#eeeef5]/50 tracking-widest text-[12px]" style={BB}>1080P</span>
          </div>

          {/* sub/dub toggle — rendered from subDub options if available, else static */}
          <div className="flex rounded overflow-hidden border border-white/10">
            {(subDubOptions.length > 0
              ? subDubOptions.map(o => ({ key: o.value.startsWith("en") ? "dub" : "sub" as "sub" | "dub", label: o.value.startsWith("en") ? "DUB" : "SUB" }))
              : [{ key: "sub" as const, label: "SUB" }, { key: "dub" as const, label: "DUB" }]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleVersionChange(key)}
                className={`px-2.5 sm:px-3 py-[5px] text-[10px] sm:text-[11px] font-bold tracking-widest
                             border-none cursor-pointer transition-all
                             ${version === key
                               ? "bg-[#c01520] text-white"
                               : "bg-transparent text-[#eeeef5]/35 hover:text-[#eeeef5]"}`}
                style={RJ}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ─── MAIN LAYOUT ─── */}
      <div className="flex flex-col lg:flex-row max-w-[1560px] mx-auto">

        {/* ─── LEFT COLUMN ─── */}
        <div className="flex-1 min-w-0 flex flex-col">

          <VideoPlayer
            src={m3u8Url}
            streams={qualityStreams}
            subtitles={subtitles}
            isDub={version === "dub"}
            onVersionFallback={handleVersionFallback}
           
          />

          {/* ─── INFO BAR ─── */}
          <div className="bg-[#0c0c16] border-b border-white/5 px-5 py-3.5
                          flex items-start justify-between gap-3.5 flex-wrap">

            <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="text-[#c01520] leading-none flex-shrink-0 text-[28px] sm:text-[36px]" style={BB}>
                {String(currentEp?.episode_number ?? 0).padStart(2, "0")}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="leading-none mb-1 overflow-hidden text-ellipsis whitespace-nowrap
                              text-[17px] sm:text-[21px]"
                  style={BB}
                >
                  {animeTitle || showSlug || "Loading…"}
                </div>
                <div className="text-[12px] sm:text-[13px] text-[#eeeef5]/45" style={DM}>
                  Episode {currentEp?.episode_string ?? "—"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 mt-0.5 w-full sm:w-auto justify-end">
              <button
                disabled={!prevEp}
                onClick={() => prevEp && handleEpisodeChange(prevEp.episodeId)}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-[7px] rounded cursor-pointer
                           transition-all border border-white/[0.09] bg-white/[0.03] text-[#eeeef5]/40
                           hover:border-[#c01520]/50 hover:text-[#ff2040]
                           disabled:opacity-20 disabled:cursor-not-allowed
                           text-[10px] sm:text-[11px] font-bold tracking-widest uppercase"
                style={RJ}
              >
                <Ico.chevL /> Prev
              </button>
              <button
                disabled={!nextEp}
                onClick={() => nextEp && handleEpisodeChange(nextEp.episodeId)}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-[7px] rounded cursor-pointer
                           transition-all bg-[#c01520] border border-[#c01520] text-white
                           hover:bg-[#e01828] hover:border-[#e01828]
                           disabled:opacity-20 disabled:cursor-not-allowed
                           text-[10px] sm:text-[11px] font-bold tracking-widest uppercase"
                style={RJ}
              >
                Next <Ico.chevR />
              </button>
            </div>
          </div>

        </div>{/* end left col */}

        {/* ─── SIDEBAR ─── */}
        <aside
          className="w-full lg:w-80 flex-shrink-0 bg-[#0a0a13]
                     border-t border-white/5 lg:border-t-0 lg:border-l
                     flex flex-col
                     h-[70vh] lg:sticky lg:top-[50px] lg:h-[calc(100vh-50px)] lg:overflow-hidden"
        >
          {/* Tab bar */}
          <div className="flex border-b border-white/5 flex-shrink-0">
            {(["episodes", "info"] as const).map(id => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 py-3 bg-transparent border-none cursor-pointer transition-all
                             text-[11px] font-bold tracking-[0.14em] uppercase border-b-2 -mb-px
                             ${tab === id
                               ? "text-[#ff2040] border-[#c01520]"
                               : "text-[#eeeef5]/20 border-transparent hover:text-[#eeeef5]/50"}`}
                style={RJ}
              >
                {id === "episodes" ? "Episodes" : "Info"}
              </button>
            ))}
          </div>

          {/* ── EPISODES TAB ── */}
          {tab === "episodes" && (
            <>
              {/* search */}
              <div className="px-2.5 pt-2.5 pb-1.5 flex-shrink-0">
                <input
                  placeholder="Search episodes…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.07] rounded
                             text-[#eeeef5] text-[12px] outline-none transition-colors
                             placeholder:text-[#eeeef5]/20 focus:border-[#c01520]/50"
                  style={DM}
                />
              </div>

              {/* page ranges (if any) */}
              {pageRanges.length > 0 && (
                <div className="px-2.5 pb-2 flex gap-1.5 flex-wrap flex-shrink-0">
                  {pageRanges.map((p, i) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`text-[12px] px-2.5 py-0.5 rounded-sm cursor-pointer transition-all border
                                   ${currentPage === p
                                     ? "bg-[#c01520]/15 border-[#c01520]/40 text-[#ff2040]"
                                     : "bg-white/[0.02] border-white/[0.07] text-[#eeeef5]/30 hover:text-[#eeeef5]/60"}`}
                      style={BB}
                    >
                      Page {p}
                    </button>
                  ))}
                </div>
              )}

              {/* count badge */}
              {(totalEps ?? episodes.length) > 0 && (
                <div className="px-3 pb-1.5 flex-shrink-0">
                  <span className="text-[10px] text-[#eeeef5]/20 tracking-widest uppercase" style={DM}>
                    {totalEps ?? episodes.length} episodes
                  </span>
                </div>
              )}

              {/* list */}
              <div ref={listRef} className="overflow-y-auto flex-1 px-2 pb-2">
                {loadingEpisodes ? (
                  <div className="flex justify-center py-10">
                    <div className="w-9 h-9 border-[3px] border-[#c01520]/25 border-t-[#c01520] rounded-full"
                         style={{ animation: "spin .8s linear infinite" }} />
                  </div>
                ) : filteredEpisodes.length === 0 ? (
                  <div className="text-center py-8 text-[#eeeef5]/30 text-[13px]" style={DM}>
                    No episodes found
                  </div>
                ) : filteredEpisodes.map(ep => {
                  const active   = ep.episodeId === episodeId;
                  const thumbUrl = buildThumbUrl(ep.thumbnail, "sm");

                  return (
                    <button
                      key={ep.episodeId}
                      data-active={active}
                      onClick={() => handleEpisodeChange(ep.episodeId)}
                      className={`group w-full text-left flex items-center gap-2.5 px-2 py-2 rounded-md mb-0.5
                                   cursor-pointer border transition-all duration-150
                                   ${active
                                     ? "bg-[#c01520]/[0.09] border-[#c01520]/[0.28]"
                                     : "bg-transparent border-transparent hover:bg-white/[0.03]"}`}
                    >
                      {/* thumbnail or number box */}
                      {thumbUrl ? (
                        <div className={`w-[72px] h-[40px] flex-shrink-0 rounded overflow-hidden relative
                                         border ${active ? "border-[#c01520]/50" : "border-white/[0.08]"}`}>
                          <img
                            src={thumbUrl}
                            alt={`Episode ${ep.episode_number}`}
                            className="w-full h-full object-cover block"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                          {active && (
                            <div className="absolute inset-0 bg-[#c01520]/30 flex items-center justify-center">
                              <Ico.play />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`w-9 h-9 rounded flex-shrink-0 flex items-center justify-center
                                      text-[15px] font-bold border
                                      ${active
                                        ? "bg-[#c01520]/20 border-[#c01520]/50 text-[#ff2040]"
                                        : "bg-white/[0.03] border-white/[0.08] text-[#eeeef5]/30"}`}
                          style={BB}
                        >
                          {ep.episode_number}
                        </div>
                      )}

                      {/* label */}
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-[13px] font-medium leading-tight truncate
                                      ${active ? "text-[#eeeef5]" : "text-[#eeeef5]/60"}`}
                          style={DM}
                        >
                          Episode {ep.episode_string}
                        </div>
                        <div
                          className="text-[10px] text-[#eeeef5]/20 mt-0.5 truncate"
                          style={DM}
                        >
                          {ep.episodeId}
                        </div>
                      </div>

                      {/* now-playing bars */}
                      {active && (
                        <div className="flex items-end gap-[2px] flex-shrink-0">
                          {NP_H.map((h, i) => (
                            <div
                              key={i}
                              className="w-[3px] rounded-sm bg-[#c01520]"
                              style={{
                                height: h,
                                animation: isPlaying
                                  ? `npb${i} ${0.55 + i * 0.1}s ease-in-out infinite alternate`
                                  : "none",
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── INFO TAB ── */}
          {tab === "info" && (
            <div className="overflow-y-auto flex-1 p-4">

              {/* title block */}
              <div className="mb-5">
                <div className="text-[28px] text-[#eeeef5] leading-tight mb-1" style={BB}>
                  {animeTitle}
                </div>
                <div className="text-[11px] text-[#eeeef5]/25 tracking-widest uppercase" style={DM}>
                  {showSlug}
                </div>
              </div>

              {/* stats */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-md py-2 px-2 text-center">
                  <div className="text-[#ff2040] text-[20px]" style={BB}>
                    {totalEps ?? episodes.length}
                  </div>
                  <div className="text-[9px] text-[#eeeef5]/20 uppercase tracking-widest mt-0.5" style={DM}>
                    Episodes
                  </div>
                </div>
                <div className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-md py-2 px-2 text-center">
                  <div className="text-[#ff2040] text-[14px]" style={BB}>
                    {version === "dub" ? "DUB" : "SUB"}
                  </div>
                  <div className="text-[9px] text-[#eeeef5]/20 uppercase tracking-widest mt-0.5" style={DM}>
                    Version
                  </div>
                </div>
              </div>

              {/* available languages */}
              {subDubOptions.length > 0 && (
                <div className="mb-4">
                  <div className="text-[10px] text-[#eeeef5]/20 uppercase tracking-[0.16em] mb-2 font-bold" style={RJ}>
                    Available Languages
                  </div>
                  <div className="flex flex-col gap-1">
                    {subDubOptions.map(opt => (
                      <div
                        key={opt.value}
                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/[0.02]
                                   border border-white/[0.06] text-[#eeeef5]/50 text-[12px]"
                        style={DM}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#c01520]" />
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* slug info */}
              <div className="mb-4">
                <div className="text-[10px] text-[#eeeef5]/20 uppercase tracking-[0.16em] mb-1.5 font-bold" style={RJ}>
                  Show ID
                </div>
                <div
                  className="text-[12px] text-[#eeeef5]/40 font-mono break-all bg-white/[0.02]
                             border border-white/[0.06] rounded px-3 py-2"
                  style={DM}
                >
                  {showSlug}
                </div>
              </div>

              {/* current episode */}
              {currentEp && (
                <div className="mb-4">
                  <div className="text-[10px] text-[#eeeef5]/20 uppercase tracking-[0.16em] mb-2 font-bold" style={RJ}>
                    Now Playing
                  </div>
                  <div className="bg-[#c01520]/[0.07] border border-[#c01520]/20 rounded-md px-3 py-2.5">
                    <div className="text-[#ff2040] text-[22px]" style={BB}>
                      Episode {currentEp.episode_number}
                    </div>
                    <div className="text-[11px] text-[#eeeef5]/35 font-mono break-all mt-0.5" style={DM}>
                      {currentEp.episodeId}
                    </div>
                    {currentEp.thumbnail && (
                      <img
                        src={buildThumbUrl(currentEp.thumbnail, "hq")}
                        alt=""
                        className="w-full rounded mt-2 object-cover"
                        style={{ aspectRatio: String(currentEp.thumbnail.aspectRatio ?? 1.77) }}
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </aside>
      </div>
    </div>
  );
}