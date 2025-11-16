"use client";

import { useState, useEffect } from "react";
import { watchlistService } from "@/utils/services/watchlist-service";
import { showService } from "@/utils/services/show-service";
import { Watchlist } from "@/types/watchlist";

interface WatchlistSelectorProps {
  tmdbId: string;
  showName: string;
  onSuccess?: () => void;
}

export function WatchlistSelector({
  tmdbId,
  showName,
  onSuccess,
}: WatchlistSelectorProps) {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<
    Watchlist["id"] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [fetchingLists, setFetchingLists] = useState(true);

  useEffect(() => {
    loadWatchlists();
  }, []);

  const loadWatchlists = async () => {
    try {
      const { data, error } = await watchlistService.getMyWatchlists();
      if (error) throw error;

      setWatchlists(data || []);

      // If user has no watchlists, create a default one
      if (!data || data.length === 0) {
        const { data: defaultList } =
          await watchlistService.createDefaultWatchlist();
        if (defaultList) {
          setWatchlists([defaultList]);
          setSelectedWatchlistId(defaultList.id);
        }
      } else {
        // Pre-select first watchlist
        setSelectedWatchlistId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading watchlists:", error);
    } finally {
      setFetchingLists(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!selectedWatchlistId) return;

    setLoading(true);
    try {
      const { error } = await showService.addToWatchlist(
        selectedWatchlistId,
        tmdbId
      );
      if (error) throw error;

      if (onSuccess) onSuccess();
      alert(`${showName} added to watchlist!`);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      alert("Failed to add show to watchlist");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingLists) {
    return <div>Loading watchlists...</div>;
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">
          Add to Watchlist:
        </label>
        <select
          value={selectedWatchlistId || ""}
          onChange={(e) => setSelectedWatchlistId(Number(e.target.value))}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a watchlist</option>
          {watchlists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name || "Unnamed"} ({list.watchlist_members?.length || 0}{" "}
              members)
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleAddToWatchlist}
        disabled={!selectedWatchlistId || loading}
        className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add to Watchlist"}
      </button>

      <button
        onClick={() => (window.location.href = "/watchlists/create")}
        className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Create New Watchlist
      </button>
    </div>
  );
}
