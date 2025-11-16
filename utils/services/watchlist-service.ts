import { supabaseBrowser } from "@/utils/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";

export class WatchlistService {
  private getSupabase(): SupabaseClient {
    return supabaseBrowser();
  }

  // Create a new watchlist
  async createWatchlist(
    name: string,
    description?: string,
    isPublic: boolean = false
  ) {
    const supabase = this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("watchlists")
      .insert({
        name,
        description,
        owner_id: user.id,
        is_public: isPublic,
      })
      .select()
      .single();

    return { data, error };
  }

  // Get all watchlists for current user (owned + member of)
  async getMyWatchlists() {
    const supabase = this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Get watchlists where user is owner OR member
    const { data, error } = await supabase
      .from("watchlists")
      .select(
        `
        *,
        watchlist_items (count),
        watchlist_members (count)
      `
      )
      .or(`owner_id.eq.${user.id},watchlist_members.user_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    return { data, error };
  }

  // Get a specific watchlist with all its shows
  async getWatchlistDetails(watchlistId: number) {
    const supabase = this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("watchlists")
      .select(
        `
        *,
        watchlist_items (
          *,
          show:tv_shows (
            id,
            tmdb_id,
            name,
            poster_url,
            backdrop_url,
            genres,
            rating,
            year
          )
        ),
        watchlist_members (
          *,
          user:auth.users (
            id,
            email
          )
        )
      `
      )
      .eq("id", watchlistId)
      .single();

    interface WatchlistMember {
      user_id: string;
      [key: string]: unknown;
    }

    interface WatchlistData {
      owner_id: string;
      is_public: boolean;
      watchlist_members?: WatchlistMember[];
      [key: string]: unknown;
    }

    const safeData = data as WatchlistData | null;

    if (
      safeData &&
      safeData.owner_id !== user.id &&
      !safeData.is_public &&
      !safeData.watchlist_members?.some((m) => m.user_id === user.id)
    ) {
      return { data: null, error: new Error("Access denied") };
    }

    return { data, error };
  }

  // Update watchlist details
  async updateWatchlist(
    watchlistId: number,
    updates: {
      name?: string;
      description?: string;
      is_public?: boolean;
    }
  ) {
    const supabase = this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("watchlists")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", watchlistId)
      .eq("owner_id", user.id) // Only owner can update
      .select()
      .single();

    return { data, error };
  }

  // Delete a watchlist
  async deleteWatchlist(watchlistId: number) {
    const supabase = this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("watchlists")
      .delete()
      .eq("id", watchlistId)
      .eq("owner_id", user.id); // Only owner can delete

    return { error };
  }

  // Add a member to watchlist
  async addMember(
    watchlistId: number,
    userEmail: string,
    role: "viewer" | "editor" | "admin" = "viewer"
  ) {
    const supabase = this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Check if current user is owner
    const { data: watchlist } = await supabase
      .from("watchlists")
      .select("owner_id")
      .eq("id", watchlistId)
      .single();

    if (watchlist?.owner_id !== user.id) {
      return { data: null, error: new Error("Only owner can add members") };
    }

    // Get user ID from email
    const { data: targetUser } = await supabase
      .from("auth.users")
      .select("id")
      .eq("email", userEmail)
      .single();

    if (!targetUser) {
      return { data: null, error: new Error("User not found") };
    }

    const { data, error } = await supabase
      .from("watchlist_members")
      .insert({
        watchlist_id: watchlistId,
        user_id: targetUser.id,
        role,
      })
      .select()
      .single();

    return { data, error };
  }

  // Remove a member from watchlist
  async removeMember(watchlistId: number, userId: string) {
    const supabase = this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Check if current user is owner
    const { data: watchlist } = await supabase
      .from("watchlists")
      .select("owner_id")
      .eq("id", watchlistId)
      .single();

    if (watchlist?.owner_id !== user.id) {
      return { error: new Error("Only owner can remove members") };
    }

    const { error } = await supabase
      .from("watchlist_members")
      .delete()
      .eq("watchlist_id", watchlistId)
      .eq("user_id", userId);

    return { error };
  }

  // Create a default personal watchlist for new users
  async createDefaultWatchlist() {
    const supabase = this.getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Check if user already has a default watchlist
    const { data: existing } = await supabase
      .from("watchlists")
      .select("id")
      .eq("owner_id", user.id)
      .eq("name", "My Shows")
      .single();

    if (existing) {
      return { data: existing, error: null };
    }

    // Create default watchlist
    return await this.createWatchlist(
      "My Shows",
      "My personal TV show watchlist",
      false
    );
  }
}

export const watchlistService = new WatchlistService();
