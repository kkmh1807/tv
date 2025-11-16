export interface WatchlistMember {
  id: number;
  watchlist_id: number | null;
  user_id: string | null;
  role?: "viewer" | "editor" | "admin";
  joined_at?: string;
}

export interface Watchlist {
  id: number;
  name: string | null;
  created_at: string;
  owner_id: string | null;
  is_public: boolean;
  watchlist_items?: Array<{
    id: number;
    show?: {
      id: number;
      name: string;
      poster_url: string | null;
      tmdb_id: string;
    };
  }>;
  _count?: {
    watchlist_items: number;
  };
}
