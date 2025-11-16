import { supabaseBrowser } from "@/utils/supabase/client";
import { tmdb } from "@/utils/tmdb/client";
import { TMDBShow } from "@/types/tmdb";
import type { SupabaseClient } from "@supabase/supabase-js";

export class ShowService {
  private getSupabase(): SupabaseClient {
    return supabaseBrowser();
  }

  async getOrFetchShow(tmdbId: string) {
    const supabase = this.getSupabase();
    const { data: existing } = await supabase
      .from("tv_shows")
      .select("*")
      .eq("tmdb_id", tmdbId)
      .single();

    if (existing) {
      return existing;
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
    );
    const tmdbShow = await response.json();

    const { data } = await supabase
      .from("tv_shows")
      .insert({
        tmdb_id: tmdbId,
        name: tmdbShow.name,
        description: tmdbShow.overview,
        poster_url: tmdbShow.poster_path
          ? `https://image.tmdb.org/t/p/w500${tmdbShow.poster_path}`
          : null,
        backdrop_url: tmdbShow.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${tmdbShow.backdrop_path}`
          : null,
        first_air_date: tmdbShow.first_air_date,
        rating: tmdbShow.vote_average,
        total_seasons: tmdbShow.number_of_seasons,
        genres: tmdbShow.genres.map((g: { name: string }) => g.name),
      })
      .select()
      .single();

    return data;
  }

  async getShowFromDB(tmdbId: string) {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from("tv_shows")
      .select("*")
      .eq("tmdb_id", tmdbId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching show from DB:", error);
    }

    return data;
  }

  async getShowFromTMDB(tmdbId: string) {
    const tmdbShow = await tmdb.getShowDetails(tmdbId);

    return {
      tmdb_id: tmdbShow.id.toString(),
      name: tmdbShow.name,
      description: tmdbShow.overview,
      poster_url: tmdb.getImageUrl(tmdbShow.poster_path, "poster", "large"),
      backdrop_url: tmdb.getImageUrl(
        tmdbShow.backdrop_path,
        "backdrop",
        "large"
      ),
      year: tmdbShow.first_air_date,
      rating: Math.round(tmdbShow.vote_average * 10) / 10,
      total_seasons: tmdbShow.number_of_seasons,
      genres: tmdbShow.genres?.map((g) => g.name) || [],
      status: tmdbShow.status,
      networks: tmdbShow.networks,
      last_air_date: tmdbShow.last_air_date,
      next_episode: tmdbShow.next_episode_to_air,
    };
  }

  private async saveShowToDatabase(tmdbShow: TMDBShow) {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from("tv_shows")
      .insert({
        tmdb_id: tmdbShow.id.toString(),
        name: tmdbShow.name,
        description: tmdbShow.overview,
        poster_url: tmdb.getImageUrl(tmdbShow.poster_path, "poster", "large"),
        backdrop_url: tmdb.getImageUrl(
          tmdbShow.backdrop_path,
          "backdrop",
          "large"
        ),
        year: tmdbShow.first_air_date,
        rating: Math.round(tmdbShow.vote_average * 10) / 10,
        total_seasons: tmdbShow.number_of_seasons,
        genres: tmdbShow.genres?.map((g) => g.name) || [],
      })
      .select()
      .single();

    if (error && error.code === "23505") {
      // Unique constraint violation
      const { data: existingShow } = await supabase
        .from("tv_shows")
        .select("*")
        .eq("tmdb_id", tmdbShow.id.toString())
        .single();

      return existingShow;
    }

    if (error) {
      throw new Error(`Failed to save show: ${error.message}`);
    }

    return data;
  }

  async searchShows(query: string) {
    const results = await tmdb.searchShows(query);

    return {
      ...results,
      results: results.results.map((show) => ({
        ...show,
        poster_url: tmdb.getImageUrl(show.poster_path, "poster", "medium"),
        backdrop_url: tmdb.getImageUrl(
          show.backdrop_path,
          "backdrop",
          "medium"
        ),
      })),
    };
  }

  // Add show to user's watchlist
  async addToMyShows(
    tmdbId: string,
    status: "watching" | "plan_to_watch" | "completed" | "dropped"
  ) {
    const supabase = this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // First check if show exists in DB
    let show = await this.getShowFromDB(tmdbId);

    // If not in DB, fetch from TMDB and save
    if (!show) {
      const tmdbShow = await tmdb.getShowDetails(tmdbId);
      show = await this.saveShowToDatabase(tmdbShow);
    }

    // First do the upsert without the select
    const { error: upsertError } = await supabase.from("user_shows").upsert(
      {
        user_id: user.id,
        show_id: show.id,
        status,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,show_id",
      }
    );

    if (upsertError) {
      return { data: null, error: upsertError };
    }

    const { data, error } = await supabase
      .from("user_shows")
      .select(
        `
      *,
      show:tv_shows (
        id,
        tmdb_id,
        name,
        description,
        poster_url,
        backdrop_url,
        year,
        rating,
        total_seasons,
        genres
      )
    `
      )
      .eq("user_id", user.id)
      .eq("show_id", show.id)
      .single();

    return { data, error };
  }

  async addToWatchlist(watchlistId: number, tmdbId: string) {
    const supabase = this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data: watchlist } = await supabase
      .from("watchlists")
      .select("*, watchlist_members!inner(*)")
      .eq("id", watchlistId)
      .or(`owner_id.eq.${user.id},watchlist_members.user_id.eq.${user.id}`)
      .single();

    if (!watchlist) {
      throw new Error("Watchlist not found or access denied");
    }

    let show = await this.getShowFromDB(tmdbId);

    if (!show) {
      const tmdbShow = await tmdb.getShowDetails(tmdbId);
      show = await this.saveShowToDatabase(tmdbShow);
    }

    const { data, error } = await supabase
      .from("watchlist_items")
      .insert({
        watchlist_id: watchlistId,
        show_id: show.id,
        added_by: user.id,
      })
      .select(
        `
        *,
        tv_shows (*)
      `
      )
      .single();

    return { data, error };
  }

  async markEpisodeWatched(
    tmdbId: string,
    seasonNumber: number,
    episodeNumber: number,
    watched: boolean = true
  ) {
    const supabase = this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data: userShow } = await supabase
      .from("user_shows")
      .select("show_id")
      .eq("user_id", user.id)
      .eq("tv_shows.tmdb_id", tmdbId)
      .single();

    if (!userShow) {
      throw new Error(
        "Show must be in your watchlist before tracking episodes"
      );
    }

    const { data, error } = await supabase
      .from("episode_progress")
      .upsert(
        {
          user_id: user.id,
          show_id: userShow.show_id,
          season_number: seasonNumber,
          episode_number: episodeNumber,
          watched,
          watched_at: watched ? new Date().toISOString() : null,
        },
        {
          onConflict: "user_id,show_id,season_number,episode_number",
        }
      )
      .select();

    return { data, error };
  }

  async getMyShows(status?: string) {
    const supabase = this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    let query = supabase
      .from("user_shows")
      .select(
        `
        *,
        tv_shows (
          id,
          tmdb_id,
          name,
          poster_url,
          backdrop_url,
          total_seasons,
          genres
        ),
        episode_progress (
          season_number,
          episode_number,
          watched,
          watched_at
        )
      `
      )
      .eq("user_id", user.id);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("updated_at", {
      ascending: false,
    });

    return { data, error };
  }

  async getShowProgress(showId: number) {
    const supabase = this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("episode_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("show_id", showId)
      .eq("watched", true)
      .order("season_number", { ascending: true })
      .order("episode_number", { ascending: true });

    return { data, error };
  }

  async removeFromMyShows(tmdbId: string) {
    const supabase = this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data: userShow } = await supabase
      .from("user_shows")
      .select("id, show_id")
      .eq("user_id", user.id)
      .eq("tv_shows.tmdb_id", tmdbId)
      .single();

    if (!userShow) {
      return { error: "Show not found in your list" };
    }

    const { error } = await supabase
      .from("user_shows")
      .delete()
      .eq("id", userShow.id);

    const { count } = await supabase
      .from("user_shows")
      .select("*", { count: "exact", head: true })
      .eq("show_id", userShow.show_id);

    if (count === 0) {
      await supabase.from("tv_shows").delete().eq("id", userShow.show_id);
    }

    return { error };
  }

  async getDiscoverShows(
    type: "popular" | "trending" | "top_rated" | "airing_today" = "popular"
  ) {
    let results;

    switch (type) {
      case "trending":
        results = await tmdb.getTrendingShows();
        break;
      case "top_rated":
        results = await tmdb.getTopRatedShows();
        break;
      case "airing_today":
        results = await tmdb.getAiringToday();
        break;
      default:
        results = await tmdb.getPopularShows();
    }

    return {
      ...results,
      results: results.results.map((show) => ({
        ...show,
        poster_url: tmdb.getImageUrl(show.poster_path, "poster", "medium"),
        backdrop_url: tmdb.getImageUrl(
          show.backdrop_path,
          "backdrop",
          "medium"
        ),
      })),
    };
  }
}

export const showService = new ShowService();
