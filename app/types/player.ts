export interface VideoSource {
  url: string;
  isM3u8: boolean;
  type: string;
  quality: string;
}

export interface SourcesData {
  headers: {
    Referer: string;
  };
  data: {
    sources: VideoSource[];
    download?: string;
  };
}

export interface PlayerEpisode {
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

export interface EpisodesResponse {
  providerEpisodes: PlayerEpisode[];
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






