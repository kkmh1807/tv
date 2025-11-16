export interface TMDBShow {
    id: number
    name: string
    overview: string
    poster_path: string | null
    backdrop_path: string | null
    first_air_date: string
    vote_average: number
    vote_count: number
    genre_ids?: number[]
    genres?: Array<{ id: number; name: string }>
    number_of_seasons: number
    number_of_episodes: number
    status: string
    type: string
    networks?: Array<{ id: number; name: string; logo_path: string }>
    created_by?: Array<{ id: number; name: string; profile_path: string }>
    seasons?: TMDBSeason[]
    last_air_date?: string
    next_episode_to_air?: TMDBEpisode
    last_episode_to_air?: TMDBEpisode
  }
  
  export interface TMDBSeason {
    id: number
    name: string
    overview: string
    poster_path: string | null
    season_number: number
    episode_count: number
    air_date: string
    episodes?: TMDBEpisode[]
  }
  
  export interface TMDBEpisode {
    id: number
    name: string
    overview: string
    episode_number: number
    season_number: number
    air_date: string
    runtime: number
    still_path: string | null
    vote_average: number
    vote_count: number
  }
  
  export interface TMDBSearchResult {
    page: number
    total_results: number
    total_pages: number
    results: TMDBShow[]
  }

  