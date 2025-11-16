"use client";

import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/utils/supabase/client";
import { Watchlist } from "@/types/watchlist";

export function MyWatchlists() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedWatchlist, setExpandedWatchlist] = useState<number | null>(
    null
  );

  useEffect(() => {
    loadWatchlists();
  }, []);

  const loadWatchlists = async () => {
    try {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Please log in to view your watchlists");
        setLoading(false);
        return;
      }

      // Get all watchlists for the user with item counts
      const { data, error: fetchError } = await supabase
        .from("watchlists")
        .select(
          `
          *,
          watchlist_items (
            id,
            show:tv_shows (
              id,
              name,
              poster_url,
              tmdb_id
            )
          )
        `
        )
        .or(`owner_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setWatchlists(data || []);
    } catch (err) {
      console.error("Error loading watchlists:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load watchlists"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (watchlistId: number, watchlistName: string) => {
    if (!confirm(`Are you sure you want to delete "${watchlistName}"?`)) return;

    try {
      const supabase = supabaseBrowser();
      const { error: deleteError } = await supabase
        .from("watchlists")
        .delete()
        .eq("id", watchlistId);

      if (deleteError) throw deleteError;

      // Remove from local state
      setWatchlists((prev) => prev.filter((w) => w.id !== watchlistId));
    } catch (err) {
      console.error("Error deleting watchlist:", err);
      alert("Failed to delete watchlist");
    }
  };

  const toggleExpanded = (watchlistId: number) => {
    setExpandedWatchlist((prev) => (prev === watchlistId ? null : watchlistId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (watchlists.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No watchlists yet
        </h3>
        <p className="text-gray-600">
          Create your first watchlist to start tracking shows!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {watchlists.map((watchlist) => (
        <div
          key={watchlist.id}
          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Watchlist Header */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {watchlist.name || "Untitled Watchlist"}
                </h3>
                {watchlist.is_public && (
                  <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                    Public
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {watchlist.watchlist_items?.length || 0} shows
                </span>

                <button
                  onClick={() => toggleExpanded(watchlist.id)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Toggle details"
                >
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      expandedWatchlist === watchlist.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() =>
                  (window.location.href = `/watchlists/${watchlist.id}`)
                }
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>

              <button
                onClick={() =>
                  (window.location.href = `/watchlists/${watchlist.id}/edit`)
                }
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Edit
              </button>

              <button
                onClick={() =>
                  handleDelete(watchlist.id, watchlist.name || "this watchlist")
                }
                className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Expanded Shows Section */}
          {expandedWatchlist === watchlist.id && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              {watchlist.watchlist_items &&
              watchlist.watchlist_items.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {watchlist.watchlist_items.slice(0, 6).map((item) => (
                    <div key={item.id} className="group">
                      {item.show?.poster_url ? (
                        <div className="aspect-[2/3] relative overflow-hidden rounded-md">
                          <img
                            src={item.show.poster_url}
                            alt={item.show.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[2/3] bg-gray-200 rounded-md flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4"
                            />
                          </svg>
                        </div>
                      )}
                      <p className="mt-1 text-xs text-gray-700 truncate">
                        {item.show?.name || "Unknown Show"}
                      </p>
                    </div>
                  ))}

                  {watchlist.watchlist_items.length > 6 && (
                    <div
                      className="aspect-[2/3] bg-gray-100 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() =>
                        (window.location.href = `/watchlists/${watchlist.id}`)
                      }
                    >
                      <span className="text-2xl font-bold text-gray-600">
                        +{watchlist.watchlist_items.length - 6}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">more</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No shows added yet</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
