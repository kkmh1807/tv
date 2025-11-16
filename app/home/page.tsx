"use client";

import { useState, useEffect } from "react";
import { ShowSearch } from "../components/ShowSearch";
import { CreateWatchlistForm } from "../components/CreateWatchlist";
import { watchlistService } from "@/utils/services/watchlist-service";
import { Watchlist } from "@/types/watchlist";
import { MyWatchlists } from "../components/MyWatchlists";

export default function Home() {
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
      setSelectedWatchlistId(data?.[0]?.id || null);
    } catch (error) {
      console.error("Error loading watchlists:", error);
    } finally {
      setFetchingLists(false);
    }
  };

  if (fetchingLists) return <div>Loading watchlists...</div>;

  return (
    <div>
      <ShowSearch />
      <MyWatchlists />
      <CreateWatchlistForm />
    </div>
  );
}
