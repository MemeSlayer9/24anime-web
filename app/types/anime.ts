export interface AnimeDetails {
  id: string;
  malId?: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
    userPreferred?: string;
  };
  image: string;
  cover: string;
  description: string;
  status: string;
  releaseDate: number;
  rating?: number;
  genres?: string[];
  totalEpisodes: number | null;
  duration?: number;
  type: string;
  studios?: string[];
  season?: string;
  popularity?: number;
  episodes?: Episode[];
  recommendations?: Recommendation[];
  characters?: Character[];
  trailer?: {
    id?: string;
    site?: string;
    thumbnail?: string;
  };
  relations?: Relation[];
}

export interface Episode {
  episodeNumber: number;
  episodeId: string;
  title: string;
  rating?: string;
  aired?: boolean;
  airDate?: string;
  overview?: string;
  thumbnail?: string;
  provider?: string;
}

export interface Recommendation {
  id: number;
  malId?: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
    userPreferred?: string;
  };
  status: string;
  episodes: number;
  image: string;
  cover?: string;
  rating?: number;
  type: string;
}

export interface Character {
  id: number;
  role: string;
  name: {
    first?: string;
    last?: string;
    full?: string;
    native?: string;
    userPreferred?: string;
  };
  image: string;
  voiceActors?: Array<{
    id: number;
    language: string;
    name: {
      first?: string;
      last?: string;
      full?: string;
      native?: string;
    };
    image: string;
  }>;
}

export interface Relation {
  id: number;
  relationType: string;
  malId?: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
    userPreferred?: string;
  };
  status: string;
  episodes?: number;
  image: string;
  color?: string;
  type: string;
  cover?: string;
  rating?: number;
}



