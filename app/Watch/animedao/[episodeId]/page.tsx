"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import VideoPlayer, { QualityStream } from "@/components/videoplayer";

/* ─── types ─── */
interface Episode {
  episodeId: string;
  episode: number;
  episodeNumber?: number;
  title?: string;
  thumbnail?: string;
  airDate?: string;
  overview?: string;
  m3u8?: string;
}

interface AnimeData {
  title?: string;
  image?: string;
  cover?: string;
  description?: string;
  synopsis?: string;
  rating?: string | number;
  score?: string | number;
  studios?: string[];
  studio?: string;
  releaseDate?: string;
  year?: string | number;
  status?: string;
  episodes?: Episode[];
  genres?: string[];
}

interface SlugEpisode {
  episode: number;
  label: string;
  slug: string;
  episodeId: string;
  url: string;
  m3u8: string;
  isFirst: boolean;
  isLast: boolean;
}

interface SlugData {
  slug: string;
  title: string;
  cover: string;
  synopsis: string;
  genres: string[];
  info: {
    Type?: string;
    Genre?: string;
    Country?: string;
    Status?: string;
    Released?: string;
  };
  episodes: SlugEpisode[];
}

interface ApiSlugResponse {
  success: boolean;
  data: SlugData;
}

/* ─── animedao source types ─── */
interface AnimeDaoQuality {
  label: string;
  resolution: string;
  bandwidth: number;
  original: string;
  proxied: string;
  player: string;
}

interface AnimeDaoServer {
  server: string;
  hash: string;
  player: string;
  proxiedM3u8: string;
  original: string;
  subtitle: string | null;
  qualities: AnimeDaoQuality[];
}

interface AnimeDaoSourceResponse {
  animeSlug?: string;
  sub?: AnimeDaoServer[];
  hsub?: AnimeDaoServer[];
  dub?: AnimeDaoServer[];
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

const API_KEY = "fuckyoubitch";
 /**https://bolok-five.vercel.app/
 * Replace the external pestengyawa.vercel.app origin with the local Next.js
 * /api/ prefix so every request routes through the rewrite proxy and avoids
 * CORS restrictions in the browser.
 */
function proxyify(url: string): string {
  if (!url) return url;
  return url.replace(/^https?:\/\/bolok-five\.vercel\.app\//i, "/api/");
}

/**
 * Route through the local proxy, ensure HTTPS (for non-relative paths),
 * and append &apiKey so the proxy middleware can authenticate.
 */
function withKey(url: string): string {
  if (!url) return url;
  // Route external origin through /api/ rewrite first
  const local = proxyify(url);
  // If still an absolute URL (some other CDN), upgrade to HTTPS
  const secure = local.startsWith("/") ? local : local.replace(/^http:\/\//i, "https://");
  // Append apiKey if not already present
  if (secure.includes("apiKey=") || secure.includes("apiKey%3D")) return secure;
  const sep = secure.includes("?") ? "&" : "?";
  return `${secure}${sep}apiKey=${API_KEY}`;
}

/** Given a server array, pick the first server and return m3u8 + QualityStream[]. */
function extractStreams(
  servers: AnimeDaoServer[] | undefined
): { m3u8: string; streams: QualityStream[]; subtitle: string | null; playerUrl: string } {
  const server = servers?.[0];
  if (!server) return { m3u8: "", streams: [], subtitle: null, playerUrl: "" };

  const streams: QualityStream[] = server.qualities.map(q => ({
    url:     withKey(q.proxied),
    quality: q.label,
    height:  parseInt(q.label) || undefined,
  }));

  return {
    m3u8:      withKey(server.proxiedM3u8),
    streams,
    subtitle:  server.subtitle ?? null,
    playerUrl: server.player ? withKey(server.player) : "",
  };
}

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
  back:  (): React.ReactElement => <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>,
  star:  (): React.ReactElement => <svg width={12} height={12} fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>,
  chevR: (): React.ReactElement => <svg width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>,
  chevL: (): React.ReactElement => <svg width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>,
  tag:   (): React.ReactElement => <svg width={11} height={11} fill="currentColor" viewBox="0 0 24 24"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>,
};

type Version = "hsub" | "sub" | "dub";

/* ══════════════════════════════════════════════════════════════════ */
export default function AnimeKaiPlayer(): React.ReactElement {

  /* ─── url params ─── */
  const [episodeId, setEpisodeId] = useState<string>("");

  /* ─── api data ─── */
  const [m3u8Url,         setM3u8Url]         = useState<string>("");
  const [qualityStreams,   setQualityStreams]   = useState<QualityStream[]>([]);
  const [subtitleUrl,     setSubtitleUrl]      = useState<string | null>(null);
  const [playerUrl,       setPlayerUrl]        = useState<string>("");
  const [sourceData,      setSourceData]       = useState<AnimeDaoSourceResponse | null>(null);
  const [animeSlug,       setAnimeSlug]        = useState<string | null>(null);
  const [loading,         setLoading]          = useState<boolean>(false);
  const [error,           setError]            = useState<string | null>(null);
  const [episodes,        setEpisodes]         = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes]  = useState<boolean>(false);
  const [animeData,       setAnimeData]        = useState<AnimeData | null>(null);

  /* ─── stream fallback state ─── */
  const [streamFailed, setStreamFailed] = useState<boolean>(false);
  const [serverIdx,    setServerIdx]    = useState<number>(0);

  /* ─── ui ─── */
  const [tab,         setTab]         = useState<"episodes" | "info">("episodes");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [epRange,     setEpRange]     = useState<string>("all");
  const [version,     setVersion]     = useState<Version>("hsub");

  /* ─── playing state mirror (for NP bars) ─── */
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const listRef = useRef<HTMLDivElement>(null);

  /* ─── extract episodeId from url path ─── */
  useEffect(() => {
    const parts = window.location.pathname.split("/");
    setEpisodeId(decodeURIComponent(parts[parts.length - 1] || ""));
  }, []);

  /* ─── fetch video source via animedao API ─── */
  useEffect(() => {
    if (!episodeId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setQualityStreams([]);
        setSourceData(null);
        setSubtitleUrl(null);
        setStreamFailed(false);
        setServerIdx(0);
        setPlayerUrl("");

        const res = await fetch(`/api/anime/animedao/source/${episodeId}?apiKey=fuckyoubitch`);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d: AnimeDaoSourceResponse = await res.json();

        setSourceData(d);
        if (d.animeSlug) setAnimeSlug(d.animeSlug);

        const defaultVersion: Version =
          d.hsub?.length ? "hsub" :
          d.sub?.length  ? "sub"  : "dub";

        setVersion(defaultVersion);

        const defaultServers =
          defaultVersion === "hsub" ? d.hsub :
          defaultVersion === "sub"  ? d.sub  : d.dub;

        const { m3u8, streams, subtitle, playerUrl: pu } = extractStreams(defaultServers);
        if (!m3u8) throw new Error("No stream source available");

        setM3u8Url(m3u8);
        setQualityStreams(streams);
        setSubtitleUrl(subtitle);
        setPlayerUrl(pu);
        setStreamFailed(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load video");
      } finally {
        setLoading(false);
      }
    })();
  }, [episodeId]);

  /* ─── re-derive streams when version toggles ─── */
  useEffect(() => {
    if (!sourceData) return;

    const servers =
      version === "dub"  ? sourceData.dub  :
      version === "sub"  ? sourceData.sub  :
      (sourceData.hsub?.length) ? sourceData.hsub : sourceData.sub;

    const { m3u8, streams, subtitle, playerUrl: pu } = extractStreams(servers);
    if (!m3u8) return;

    setM3u8Url(m3u8);
    setQualityStreams(streams);
    setSubtitleUrl(subtitle);
    setPlayerUrl(pu);
    setStreamFailed(false);
    setServerIdx(0);
  }, [version, sourceData]);

  /* ─── fetch episodes via animedao slug endpoint ─── */
  useEffect(() => {
    if (!animeSlug) return;
    (async () => {
      try {
        setLoadingEpisodes(true);
        const res = await fetch(
          `/api/anime/animedao/episodes/${animeSlug}?apiKey=fuckyoubitch`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const raw: Array<{
          episodeId: string;
          episode:   number;
          title?:    string;
          date?:     string;
        }> = Array.isArray(json.episodes) ? json.episodes : [];

        // Deduplicate by episodeId — keep first occurrence
        const seen = new Set<string>();
        const mapped: Episode[] = raw
          .filter(ep => {
            if (seen.has(ep.episodeId)) return false;
            seen.add(ep.episodeId);
            return true;
          })
          .map(ep => ({
            episodeId:     ep.episodeId,
            episode:       ep.episode,
            episodeNumber: ep.episode,
            title:         ep.title,
            airDate:       ep.date,
          }));

        setEpisodes(mapped);
      } catch (e) {
        console.error("episodes fetch error:", e);
      } finally {
        setLoadingEpisodes(false);
      }
    })();
  }, [animeSlug]);

  /* ─── fetch anime info via slug ─── */
  useEffect(() => {
    if (!animeSlug) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/anime/animedao/episodes/${animeSlug}?apiKey=fuckyoubitch`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiSlugResponse = await res.json();
        if (!json.success) throw new Error("Slug API unsuccessful");
        const d = json.data;

        setAnimeData({
          title:       d.title,
          cover:       d.cover,
          synopsis:    d.synopsis,
          genres:      d.genres,
          status:      d.info?.Status,
          releaseDate: d.info?.Released,
          year:        d.info?.Released,
        });
      } catch (e) {
        console.error("slug info error:", e);
      }
    })();
  }, [animeSlug]);

  /* ─── version / episode navigation ─── */
  const handleVersionChange = useCallback((v: Version): void => {
    setVersion(v);
  }, []);

  const handleEpisodeChange = useCallback((newId: string): void => {
    const params = new URLSearchParams(window.location.search);
    const base   = window.location.pathname.split("/").slice(0, -1).join("/");
    window.history.pushState({}, "", `${base}/${encodeURIComponent(newId)}?${params}`);
    setEpisodeId(newId);
  }, []);

  /* ─── stream fail handler: cycle servers, then fall back to iframe ─── */
  const handleStreamFail = useCallback((): void => {
    if (!sourceData) return;

    const servers =
      version === "dub"  ? sourceData.dub  :
      version === "sub"  ? sourceData.sub  :
      (sourceData.hsub?.length) ? sourceData.hsub : sourceData.sub;

    const nextIdx = serverIdx + 1;

    if (servers && nextIdx < servers.length) {
      const { m3u8, streams, subtitle, playerUrl: pu } = extractStreams([servers[nextIdx]]);
      setServerIdx(nextIdx);
      setM3u8Url(m3u8);
      setQualityStreams(streams);
      setSubtitleUrl(subtitle);
      setPlayerUrl(pu);
    } else {
      // All servers exhausted — fall back to iframe player of first server
      const firstPlayer = servers?.[0]?.player;
      if (firstPlayer) setPlayerUrl(withKey(firstPlayer));
      setStreamFailed(true);
    }
  }, [sourceData, version, serverIdx]);

  /* ─── derived values ─── */
  const currentEpisode = episodes.find(e => e.episodeId === episodeId);
  const currentIdx     = episodes.findIndex(e => e.episodeId === episodeId);
  const prevEp         = currentIdx > 0 ? episodes[currentIdx - 1] : null;
  const nextEp         = currentIdx < episodes.length - 1 ? episodes[currentIdx + 1] : null;
  const animeTitle     = animeData?.title ?? "";
  const cover          = animeData?.image ?? animeData?.cover ?? "";
  const synopsis       = animeData?.description ?? animeData?.synopsis ?? "";
  const rating         = animeData?.rating ?? animeData?.score ?? "";
  const studio         = animeData?.studios?.[0] ?? animeData?.studio ?? "";
  const year           = animeData?.releaseDate ?? animeData?.year ?? "";
  const status         = animeData?.status ?? "";
  const genres         = animeData?.genres ?? [];

  // Track availability
  const hsubAvailable = Boolean(sourceData?.hsub && sourceData.hsub.length > 0);
  const subAvailable  = Boolean(sourceData?.sub  && sourceData.sub.length  > 0);
  const dubAvailable  = Boolean(sourceData?.dub  && sourceData.dub.length  > 0);

  const versionTracks: { key: Version; label: string; available: boolean }[] = [
    { key: "hsub", label: "HSUB", available: hsubAvailable },
    { key: "sub",  label: "SUB",  available: subAvailable  },
    { key: "dub",  label: "DUB",  available: dubAvailable  },
  ];

  const ranges: string[] = [];
  for (let i = 1; i <= episodes.length; i += 25)
    ranges.push(`${i}-${Math.min(i + 24, episodes.length)}`);

  const filteredEpisodes = episodes.filter(ep => {
    const matchSearch =
      searchQuery === "" ||
      String(ep.episode).includes(searchQuery) ||
      ep.episodeId.toLowerCase().includes(searchQuery.toLowerCase());
    if (epRange === "all") return matchSearch;
    const [s, e] = epRange.split("-").map(Number);
    return matchSearch && ep.episode >= s && ep.episode <= e;
  });

  const NP_H = [8, 14, 10, 16, 6] as const;

  /* ─── stable VideoPlayer callbacks ─── */
  const handlePrev = useCallback((): void => {
    if (prevEp) handleEpisodeChange(prevEp.episodeId);
  }, [prevEp, handleEpisodeChange]);

  const handleNext = useCallback((): void => {
    if (nextEp) handleEpisodeChange(nextEp.episodeId);
  }, [nextEp, handleEpisodeChange]);

  /* ─── SEO meta ─── */
  useEffect(() => {
    if (!animeTitle || !currentEpisode) return;
    const pageTitle   = `Episode ${currentEpisode.episode} - ${animeTitle}`;
    const description = currentEpisode.overview || `Watch ${animeTitle} Episode ${currentEpisode.episode}`;
    document.title = pageTitle;
    upsertMeta('meta[name="description"]',         "name",     "description",         description);
    upsertMeta('meta[property="og:title"]',        "property", "og:title",            pageTitle);
    upsertMeta('meta[property="og:description"]',  "property", "og:description",      description);
    upsertMeta('meta[name="twitter:title"]',       "name",     "twitter:title",       pageTitle);
    upsertMeta('meta[name="twitter:description"]', "name",     "twitter:description", description);
    if (currentEpisode.thumbnail) {
      upsertMeta('meta[property="og:image"]',  "property", "og:image",      currentEpisode.thumbnail);
      upsertMeta('meta[name="twitter:image"]', "name",     "twitter:image", currentEpisode.thumbnail);
    }
    return () => { document.title = "Watch Anime"; };
  }, [animeTitle, currentEpisode]);

  /* ─── scroll active ep into view ─── */
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>("[data-active='true']")
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [episodeId, epRange]);

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
          {/* quality / iframe badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded
                          bg-white/[0.04] border border-white/[0.08]">
            <div className="w-[5px] h-[5px] rounded-full bg-[#ff2040]"
                 style={{ animation: "blink 2s ease-in-out infinite" }} />
            <span className="text-[#eeeef5]/50 tracking-widest text-[12px]" style={BB}>
              {streamFailed ? "IFRAME" : "1080P"}
            </span>
          </div>

          {/* hsub / sub / dub toggle */}
          <div className="flex rounded overflow-hidden border border-white/10">
            {versionTracks.map(({ key, label, available }) => (
              <button
                key={key}
                onClick={() => handleVersionChange(key)}
                disabled={!available}
                className={`px-2.5 sm:px-3 py-[5px] text-[10px] sm:text-[11px] font-bold tracking-widest
                             border-none cursor-pointer transition-all
                             ${version === key
                               ? "bg-[#c01520] text-white"
                               : "bg-transparent text-[#eeeef5]/35 hover:text-[#eeeef5]"}
                             disabled:opacity-20 disabled:cursor-not-allowed`}
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

        {/* ─── LEFT COLUMN: video + info bar ─── */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* ─── VIDEO / IFRAME ─── */}
          {streamFailed && playerUrl ? (
            <div className="w-full bg-black" style={{ aspectRatio: "16/9" }}>
              <iframe
                src={playerUrl}
                className="w-full h-full border-0"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>
          ) : (
            <VideoPlayer
              src={m3u8Url}
              streams={qualityStreams}
              subtitles={subtitleUrl ? [subtitleUrl] : []}
              isDub={version === "dub"}
              onVersionFallback={handleStreamFail}
            />
          )}

          {/* ─── INFO BAR ─── */}
          <div className="bg-[#0c0c16] border-b border-white/5 px-5 py-3.5
                          flex items-start justify-between gap-3.5 flex-wrap">

            <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="text-[#c01520] leading-none flex-shrink-0 text-[28px] sm:text-[36px]" style={BB}>
                {String(currentEpisode?.episode ?? 0).padStart(2, "0")}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="leading-none mb-1 cursor-pointer hover:text-[#ff2040] transition-colors
                              overflow-hidden text-ellipsis whitespace-nowrap text-[17px] sm:text-[21px]"
                  style={BB}
                >
                  {animeSlug
                    ? animeSlug
                        .split("-")
                        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")
                    : animeTitle || "yawa"}
                </div>
                <div className="text-[12px] sm:text-[13px] text-[#eeeef5]/45" style={DM}>
                  {currentEpisode?.title ?? ""}
                </div>
                {currentEpisode?.airDate && (
                  <div className="text-[10px] text-[#eeeef5]/20 mt-0.5 tracking-widest uppercase" style={DM}>
                    Aired {fmtDate(currentEpisode.airDate)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 mt-0.5 w-full sm:w-auto justify-end">
              <button
                disabled={!prevEp}
                onClick={() => prevEp && handleEpisodeChange(prevEp.episodeId)}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-[7px] rounded cursor-pointer
                           transition-all border border-white/[0.09] bg-white/[0.03] text-[#eeeef5]/40
                           hover:border-[#c01520]/50 hover:text-[#ff2040] active:border-[#c01520]/50 active:text-[#ff2040]
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
                           hover:bg-[#e01828] hover:border-[#e01828] active:bg-[#e01828]
                           disabled:opacity-20 disabled:cursor-not-allowed
                           text-[10px] sm:text-[11px] font-bold tracking-widest uppercase"
                style={RJ}
              >
                Next <Ico.chevR />
              </button>
            </div>
          </div>

        </div>{/* end lcol */}

        {/* ─── SIDEBAR ─── always visible, stacks below on mobile ─── */}
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

              <div className="px-2.5 pb-2 flex gap-1.5 flex-wrap flex-shrink-0">
                {["all", ...ranges].map(r => (
                  <button
                    key={r}
                    onClick={() => setEpRange(r)}
                    className={`text-[12px] px-2.5 py-0.5 rounded-sm cursor-pointer transition-all border
                                 ${epRange === r
                                   ? "bg-[#c01520]/15 border-[#c01520]/40 text-[#ff2040]"
                                   : "bg-white/[0.02] border-white/[0.07] text-[#eeeef5]/30 hover:text-[#eeeef5]/60"}`}
                    style={BB}
                  >
                    {r === "all" ? "All" : r}
                  </button>
                ))}
              </div>

              <div ref={listRef} className="overflow-y-auto flex-1 px-2 pb-2">
                {loadingEpisodes ? (
                  <div className="flex justify-center py-10">
                    <div className="w-9 h-9 border-[3px] border-[#c01520]/25 border-t-[#c01520] rounded-full"
                         style={{ animation: "spin .8s linear infinite" }} />
                  </div>
                ) : filteredEpisodes.length === 0 ? (
                  <div className="text-center py-8 text-[#eeeef5]/30 text-[13px]" style={DM}>No episodes found</div>
                ) : filteredEpisodes.map(ep => {
                  const active = ep.episodeId === episodeId;
                  return (
                    <button
                      key={ep.episodeId}
                      data-active={active}
                      onClick={() => handleEpisodeChange(ep.episodeId)}
                      className={`group w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-md mb-0.5
                                   cursor-pointer border transition-all duration-150
                                   ${active
                                     ? "bg-[#c01520]/[0.09] border-[#c01520]/[0.28]"
                                     : "bg-transparent border-transparent hover:bg-white/[0.03] active:bg-white/[0.05]"}`}
                    >
                      <div
                        className={`w-9 h-9 rounded flex-shrink-0 flex items-center justify-center
                                    text-[15px] font-bold border
                                    ${active
                                      ? "bg-[#c01520]/20 border-[#c01520]/50 text-[#ff2040]"
                                      : "bg-white/[0.03] border-white/[0.08] text-[#eeeef5]/30"}`}
                        style={BB}
                      >
                        {ep.episode}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-[13px] font-medium leading-tight truncate
                                      ${active ? "text-[#eeeef5]" : "text-[#eeeef5]/60"}`}
                          style={DM}
                        >
                          {ep.title ?? `Episode ${ep.episode}`}
                        </div>
                        {ep.airDate && (
                          <div className="text-[10px] text-[#eeeef5]/20 mt-0.5" style={DM}>
                            {fmtDate(ep.airDate)}
                          </div>
                        )}
                      </div>

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
            <div className="overflow-y-auto flex-1 p-3">

              {cover && (
                <div className="rounded-lg overflow-hidden mb-3 relative" style={{ aspectRatio: "3/4" }}>
                  <img src={cover} alt={animeTitle} className="w-full h-full object-cover block" />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top,rgba(8,8,16,0.95) 0%,rgba(8,8,16,0.3) 50%,transparent 100%)" }}
                  />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="text-white leading-tight mb-0.5 text-[22px]" style={BB}>{animeTitle}</div>
                    {status && (
                      <div className="text-white/40 text-[10px] tracking-[0.14em] uppercase" style={DM}>{status}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-1.5 mb-3">
                {rating && (
                  <div className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-md py-2 px-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-[#ff2040] text-[18px]" style={BB}>
                      <Ico.star />{rating}
                    </div>
                    <div className="text-[9px] text-[#eeeef5]/20 uppercase tracking-widest mt-0.5" style={DM}>Rating</div>
                  </div>
                )}
                <div className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-md py-2 px-2 text-center">
                  <div className="text-[#ff2040] text-[18px]" style={BB}>{episodes.length}</div>
                  <div className="text-[9px] text-[#eeeef5]/20 uppercase tracking-widest mt-0.5" style={DM}>Episodes</div>
                </div>
                {year && (
                  <div className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-md py-2 px-2 text-center">
                    <div className="text-[#ff2040] text-[14px]" style={BB}>{year}</div>
                    <div className="text-[9px] text-[#eeeef5]/20 uppercase tracking-widest mt-0.5" style={DM}>Year</div>
                  </div>
                )}
              </div>

              {studio && (
                <div className="mb-3">
                  <div className="text-[10px] text-[#eeeef5]/20 uppercase tracking-[0.16em] mb-1.5 font-bold" style={RJ}>Studio</div>
                  <span className="text-[#eeeef5]/60 text-[15px] tracking-wide" style={BB}>{studio}</span>
                </div>
              )}

              {status && (
                <div className="mb-3">
                  <div className="text-[10px] text-[#eeeef5]/20 uppercase tracking-[0.16em] mb-1.5 font-bold" style={RJ}>Status</div>
                  <span className="text-[#c01520] text-[14px] tracking-wide" style={BB}>{status}</span>
                </div>
              )}

              {genres.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] text-[#eeeef5]/20 uppercase tracking-[0.16em] mb-2 font-bold" style={RJ}>Genres</div>
                  <div className="flex flex-wrap gap-1">
                    {genres.map(g => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded-sm bg-white/[0.03] border border-white/[0.07]
                                   text-[#eeeef5]/40 text-[10px] tracking-wide"
                        style={DM}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {synopsis && (
                <div className="mb-3">
                  <div className="text-[10px] text-[#eeeef5]/20 uppercase tracking-[0.16em] mb-1.5 font-bold" style={RJ}>Synopsis</div>
                  <p className="text-[12px] leading-relaxed text-[#eeeef5]/40" style={DM}>{synopsis}</p>
                </div>
              )}

            </div>
          )}
        </aside>
      </div>
    </div>
  );
}