import { TMDBEpisode, TMDBSearchResult, TMDBSeason, TMDBShow } from "@/types/tmdb"

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export const TMDB_IMAGE_SIZES = {
  poster: {
    small: `${TMDB_IMAGE_BASE}/w185`,
    medium: `${TMDB_IMAGE_BASE}/w342`,
    large: `${TMDB_IMAGE_BASE}/w500`,
    original: `${TMDB_IMAGE_BASE}/original`
  },
  backdrop: {
    small: `${TMDB_IMAGE_BASE}/w300`,
    medium: `${TMDB_IMAGE_BASE}/w780`,
    large: `${TMDB_IMAGE_BASE}/w1280`,
    original: `${TMDB_IMAGE_BASE}/original`
  },
  profile: {
    small: `${TMDB_IMAGE_BASE}/w185`,
    medium: `${TMDB_IMAGE_BASE}/w342`,
    large: `${TMDB_IMAGE_BASE}/h632`,
    original: `${TMDB_IMAGE_BASE}/original`
  }
}



export class TMDBClient {
  private async fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`)
    url.searchParams.append('api_key', TMDB_API_KEY)
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }

  async searchShows(query: string, page: number = 1): Promise<TMDBSearchResult> {
    return this.fetchTMDB<TMDBSearchResult>('/search/tv', {
      query,
      page: page.toString()
    })
  }

  async getShowDetails(tmdbId: number | string): Promise<TMDBShow> {
    return this.fetchTMDB<TMDBShow>(`/tv/${tmdbId}`, {
      append_to_response: 'seasons,credits'
    })
  }

  async getSeasonDetails(tmdbId: number | string, seasonNumber: number): Promise<TMDBSeason> {
    return this.fetchTMDB<TMDBSeason>(`/tv/${tmdbId}/season/${seasonNumber}`)
  }

  async getEpisodeDetails(
    tmdbId: number | string, 
    seasonNumber: number, 
    episodeNumber: number
  ): Promise<TMDBEpisode> {
    return this.fetchTMDB<TMDBEpisode>(
      `/tv/${tmdbId}/season/${seasonNumber}/episode/${episodeNumber}`
    )
  }

  async getPopularShows(page: number = 1): Promise<TMDBSearchResult> {
    return this.fetchTMDB<TMDBSearchResult>('/tv/popular', {
      page: page.toString()
    })
  }

  async getTrendingShows(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBSearchResult> {
    return this.fetchTMDB<TMDBSearchResult>(`/trending/tv/${timeWindow}`)
  }

  async getTopRatedShows(page: number = 1): Promise<TMDBSearchResult> {
    return this.fetchTMDB<TMDBSearchResult>('/tv/top_rated', {
      page: page.toString()
    })
  }

  async getAiringToday(page: number = 1): Promise<TMDBSearchResult> {
    return this.fetchTMDB<TMDBSearchResult>('/tv/airing_today', {
      page: page.toString()
    })
  }

  async getSimilarShows(tmdbId: number | string, page: number = 1): Promise<TMDBSearchResult> {
    return this.fetchTMDB<TMDBSearchResult>(`/tv/${tmdbId}/similar`, {
      page: page.toString()
    })
  }

  getImageUrl(path: string | null, type: 'poster' | 'backdrop' | 'profile' = 'poster', size: 'small' | 'medium' | 'large' | 'original' = 'medium'): string | null {
    if (!path) return null
    return `${TMDB_IMAGE_SIZES[type][size]}${path}`
  }
}

export const tmdb = new TMDBClient()
