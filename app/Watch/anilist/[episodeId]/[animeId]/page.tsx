"use client";
import React, { useState, useEffect, useRef } from "react";

/* ─── types ─── */
interface AnilistEpisode {
  episode: number;
  absoluteEpisode?: number;
  title: string;
  overview?: string;
  airDate?: string;
  aired?: boolean;
  rating?: string;
  thumbnail?: string;
  seasonNumber?: number;
  episodeNumber?: number;
}

interface AnilistAnime {
  title?: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  image?: string;
  cover?: string;
  description?: string;
  status?: string;
  genres?: string[];
}

interface AnilistResponse {
  success: boolean;
  anime?: AnilistAnime;
  episodes: {
    total: number;
    merged: AnilistEpisode[];
  };
}

/* ─── tiny helpers ─── */
const fmtDate = (d?: string): string => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return d; }
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

/* ─── font shorthands ─── */
const BB: React.CSSProperties = { fontFamily: "'Bebas Neue', sans-serif" };
const RJ: React.CSSProperties = { fontFamily: "'Rajdhani', sans-serif" };
const DM: React.CSSProperties = { fontFamily: "'DM Sans', sans-serif" };

/* ─── global styles ─── */
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
  chevR: (): React.ReactElement => <svg width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>,
  chevL: (): React.ReactElement => <svg width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>,
  tag:   (): React.ReactElement => <svg width={11} height={11} fill="currentColor" viewBox="0 0 24 24"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>,
};

const NP_H = [8, 14, 10, 16, 6] as const;

/* ══════════════════════════════════════════════════════ */
export default function AnilistPlayer(): React.ReactElement {

  /* ─── url params ─── */
  const [episodeId, setEpisodeId] = useState<string>("");
  const [animeId,   setAnimeId]   = useState<string>("");

  /* ─── api data ─── */
  const [episodes,        setEpisodes]        = useState<AnilistEpisode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState<boolean>(false);
  const [error,           setError]           = useState<string | null>(null);
  const [animeInfo,       setAnimeInfo]       = useState<AnilistAnime | null>(null);

  /* ─── ui ─── */
  const [tab,           setTab]           = useState<"episodes" | "info">("episodes");
  const [version,       setVersion]       = useState<"sub" | "dub">("sub");
  const [searchQuery,   setSearchQuery]   = useState<string>("");
  const [epRange,       setEpRange]       = useState<string>("all");
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);

  const listRef = useRef<HTMLDivElement>(null);

  /* ─── extract route params ─── */
  useEffect(() => {
    const parts = window.location.pathname.split("/");
    const epId  = parts[parts.length - 2] || "";
    const anId  = parts[parts.length - 1] || "";
    setEpisodeId(decodeURIComponent(epId));
    setAnimeId(decodeURIComponent(anId));
  }, []);

  /* ─── fetch episodes ─── */
  useEffect(() => {
    if (!animeId) return;
    (async () => {
      try {
        setLoadingEpisodes(true);
        setError(null);
        const res  = await fetch(`https://maaa-six.vercel.app/api/anime/${animeId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: AnilistResponse = await res.json();

        if (Array.isArray(json?.episodes?.merged)) {
          setEpisodes(
            [...json.episodes.merged].sort((a, b) => (a.episode ?? 0) - (b.episode ?? 0))
          );
        }
        setAnimeInfo(json?.anime ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load episodes");
      } finally {
        setLoadingEpisodes(false);
      }
    })();
  }, [animeId]);

  /* ─── derived values ─── */
  const t          = animeInfo?.title ?? {};
  const animeTitle = t.english || t.romaji || t.native || "";
  const cover      = animeInfo?.cover || animeInfo?.image || "";

  const currentEpisode = episodes.find(ep => String(ep.episode) === String(episodeId));
  const currentIdx     = episodes.findIndex(ep => String(ep.episode) === String(episodeId));
  const prevEp         = currentIdx > 0 ? episodes[currentIdx - 1] : null;
  const nextEp         = currentIdx < episodes.length - 1 ? episodes[currentIdx + 1] : null;

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

  /* ─── reset iframe loading on episode/version change ─── */
  useEffect(() => { setIframeLoading(true); }, [episodeId, version]);

  /* ─── navigation ─── */
  const handleEpisodeChange = (newEpNum: number): void => {
    window.history.pushState({}, "", `/Watch/anilist/${newEpNum}/${animeId}`);
    setEpisodeId(String(newEpNum));
  };

  /* ─── range chips ─── */
  const ranges: string[] = [];
  for (let i = 1; i <= episodes.length; i += 25)
    ranges.push(`${i}-${Math.min(i + 24, episodes.length)}`);

  /* ─── filtered episodes ─── */
  const filteredEpisodes = episodes.filter(ep => {
    const matchSearch =
      searchQuery === "" ||
      String(ep.episode).includes(searchQuery) ||
      ep.title?.toLowerCase().includes(searchQuery.toLowerCase());
    if (epRange === "all") return matchSearch;
    const [s, e] = epRange.split("-").map(Number);
    return matchSearch && ep.episode >= s && ep.episode <= e;
  });

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
  if (!episodeId || !animeId) return (
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
  /* ══════════════════════ MAIN RENDER ══════════════════════ */
  return (
    <div className="min-h-screen bg-[#080810] text-[#eeeef5]" style={RJ}>
      <style>{MIN_STYLES}</style>

      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-[100] h-[50px] flex items-center gap-2 sm:gap-3.5 px-3 sm:px-4
                      bg-[#080810]/92 backdrop-blur-2xl border-b border-[#c01520]/15">

        

        <div className="ml-auto flex items-center gap-2">
          {/* live badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded
                          bg-white/[0.04] border border-white/[0.08]">
            <div className="w-[5px] h-[5px] rounded-full bg-[#ff2040]"
                 style={{ animation: "blink 2s ease-in-out infinite" }} />
            <span className="text-[#eeeef5]/50 tracking-widest text-[12px]" style={BB}>STREAM</span>
          </div>

          {/* sub / dub toggle */}
          <div className="flex rounded overflow-hidden border border-white/10">
            {(["sub", "dub"] as const).map(v => (
              <button
                key={v}
                onClick={() => setVersion(v)}
                className={`px-3 py-[5px] text-[11px] font-bold tracking-widest
                             border-none cursor-pointer transition-all
                             ${version === v
                               ? "bg-[#c01520] text-white"
                               : "bg-transparent text-[#eeeef5]/35 hover:text-[#eeeef5]"}`}
                style={RJ}
              >
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ─── MAIN LAYOUT ─── */}
      <div className="flex flex-col lg:flex-row max-w-[1560px] mx-auto">
        <div className="flex-1 min-w-0 flex flex-col">

          {/* ─── IFRAME PLAYER ─── */}
          <div className="relative w-full bg-black aspect-video">
            {iframeLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center
                              bg-[#080810] gap-4">
                <div className="w-[52px] h-[52px] border-[3px] border-[#c01520]/30 border-t-[#c01520]
                                rounded-full"
                     style={{ animation: "spin .8s linear infinite" }} />
                <div className="text-[#eeeef5]/40 text-[14px] tracking-widest" style={BB}>
                  Initializing Stream…
                </div>
              </div>
            )}
            {currentEpisode ? (
              <iframe
                key={`${animeId}-${currentEpisode.episode}-${version}`}
                src={`https://megaplay.buzz/stream/ani/${animeId}/${currentEpisode.episode}/${version}`}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ border: "none" }}
                onLoad={() => setIframeLoading(false)}
              />
            ) : loadingEpisodes ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-[52px] h-[52px] border-[3px] border-[#c01520]/30 border-t-[#c01520]
                                rounded-full"
                     style={{ animation: "spin .8s linear infinite" }} />
                <div className="text-[#eeeef5]/40 text-[14px] tracking-widest" style={BB}>
                  Loading Episode…
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-[#eeeef5]/30 text-sm" style={DM}>Episode not found</p>
              </div>
            )}
          </div>

          {/* ─── INFO BAR ─── */}
          {currentEpisode && (
            <div className="bg-[#0c0c16] border-b border-white/5 px-5 py-3.5
                            flex items-start justify-between gap-3.5 flex-wrap">
            <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="text-[#c01520] leading-none flex-shrink-0 text-[28px] sm:text-[36px]" style={BB}>
                  {String(currentEpisode.episode ?? 0).padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                 <div
                  className="leading-none mb-1 cursor-pointer hover:text-[#ff2040] transition-colors
                              overflow-hidden text-ellipsis whitespace-nowrap text-[17px] sm:text-[21px]"
                  style={BB}
                    onClick={() => { window.location.href = `/details/${animeId}`; }}
                  >
                    {animeTitle || "Loading…"}
                  </div>
                <div className="text-[12px] sm:text-[13px] text-[#eeeef5]/45" style={DM}>
                    {currentEpisode.title ?? ""}
                  </div>
                  {currentEpisode.airDate && (
                    <div className="text-[10px] text-[#eeeef5]/20 mt-0.5 tracking-widest uppercase" style={DM}>
                      Aired {fmtDate(currentEpisode.airDate)}
                    </div>
                  )}
                  {currentEpisode.overview && (
                    <p className="text-[11px] text-[#eeeef5]/30 mt-1 line-clamp-2 max-w-xl" style={DM}>
                      {currentEpisode.overview}
                    </p>
                  )}
                </div>
              </div>

            <div className="flex items-center gap-2 flex-shrink-0 mt-0.5 w-full sm:w-auto justify-end">
                <button
                  disabled={!prevEp}
                  onClick={() => prevEp && handleEpisodeChange(prevEp.episode)}
                  className="flex items-center gap-1.5 px-3.5 py-[7px] rounded cursor-pointer transition-all
                             border border-white/[0.09] bg-white/[0.03] text-[#eeeef5]/40
                             hover:border-[#c01520]/50 hover:text-[#ff2040]
                             disabled:opacity-20 disabled:cursor-not-allowed
                             text-[11px] font-bold tracking-widest uppercase"
                  style={RJ}
                >
                  <Ico.chevL /> Prev
                </button>
                <button
                  disabled={!nextEp}
                  onClick={() => nextEp && handleEpisodeChange(nextEp.episode)}
                  className="flex items-center gap-1.5 px-3.5 py-[7px] rounded cursor-pointer transition-all
                             bg-[#c01520] border border-[#c01520] text-white
                             hover:bg-[#e01828] hover:border-[#e01828]
                             disabled:opacity-20 disabled:cursor-not-allowed
                             text-[11px] font-bold tracking-widest uppercase"
                  style={RJ}
                >
                  Next <Ico.chevR />
                </button>
              </div>
            </div>
          )}

        </div>{/* end left column */}

        {/* ─── SIDEBAR ─── */}
         <aside
          className="w-full lg:w-80 flex-shrink-0 bg-[#0a0a13]
                     border-t border-white/5 lg:border-t-0 lg:border-l
                     flex flex-col
                     h-[70vh] lg:sticky lg:top-[50px] lg:h-[calc(100vh-50px)] lg:overflow-hidden"
        >

          {/* tab header */}
          
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

              {/* range filters */}
              <div className="px-2.5 pb-2 flex gap-1.5 flex-wrap items-center flex-shrink-0">
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
                <span className="text-[#eeeef5]/20 text-[11px] ml-auto" style={DM}>
                  {filteredEpisodes.length}/{episodes.length}
                </span>
              </div>

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
                  const active = String(ep.episode) === String(episodeId);
                  return (
                    <button
                      key={ep.episode}
                      data-active={active}
                      onClick={() => handleEpisodeChange(ep.episode)}
                      className={`group w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-md mb-0.5
                                   cursor-pointer border transition-all duration-150
                                   ${active
                                     ? "bg-[#c01520]/[0.09] border-[#c01520]/[0.28]"
                                     : "bg-transparent border-transparent hover:bg-white/[0.03]"}`}
                    >
                      {/* episode number badge */}
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

                      {/* episode info */}
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-[13px] font-medium leading-tight truncate
                                      ${active ? "text-[#eeeef5]" : "text-[#eeeef5]/60"}`}
                          style={DM}
                        >
                          {ep.title || `Episode ${ep.episode}`}
                        </div>
                        {ep.airDate && (
                          <div className="text-[10px] text-[#eeeef5]/20 mt-0.5" style={DM}>
                            {fmtDate(ep.airDate)}
                          </div>
                        )}
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
                                animation: `npb${i} ${0.55 + i * 0.1}s ease-in-out infinite alternate`,
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
                  </div>
                </div>
              )}

              {/* stats row */}
              <div className="flex gap-1.5 mb-3">
                <div className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-md py-2 px-2 text-center">
                  <div className="text-[#ff2040] text-[18px]" style={BB}>{episodes.length}</div>
                  <div className="text-[9px] text-[#eeeef5]/20 uppercase tracking-widest mt-0.5" style={DM}>Episodes</div>
                </div>
                {animeInfo?.status && (
                  <div className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-md py-2 px-2 text-center">
                    <div className="text-[#ff2040] text-[13px] leading-tight" style={BB}>{animeInfo.status}</div>
                    <div className="text-[9px] text-[#eeeef5]/20 uppercase tracking-widest mt-0.5" style={DM}>Status</div>
                  </div>
                )}
              </div>

              {/* genres */}
              {Array.isArray(animeInfo?.genres) && (animeInfo?.genres?.length ?? 0) > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] text-[#eeeef5]/20 uppercase tracking-[0.16em] mb-2 font-bold" style={RJ}>Genres</div>
                  <div className="flex flex-wrap gap-1">
                    {animeInfo!.genres!.map(g => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded-sm bg-white/[0.03] border border-white/[0.07]
                                   text-[#eeeef5]/40 text-[10px] tracking-wide flex items-center gap-1"
                        style={DM}
                      >
                        <Ico.tag />{g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* description */}
              {animeInfo?.description && (
                <div className="mb-3">
                  <div className="text-[10px] text-[#eeeef5]/20 uppercase tracking-[0.16em] mb-1.5 font-bold" style={RJ}>Synopsis</div>
                  <p className="text-[12px] leading-relaxed text-[#eeeef5]/40" style={DM}>
                    {animeInfo.description}
                  </p>
                </div>
              )}

              {/* current episode overview */}
              {currentEpisode?.overview && (
                <div className="mb-3">
                  <div className="text-[10px] text-[#eeeef5]/20 uppercase tracking-[0.16em] mb-1.5 font-bold" style={RJ}>
                    Episode Overview
                  </div>
                  <p className="text-[12px] leading-relaxed text-[#eeeef5]/40" style={DM}>
                    {currentEpisode.overview}
                  </p>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}