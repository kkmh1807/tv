"use client";

import { useState } from "react";
import { watchlistService } from "@/utils/services/watchlist-service";

export function CreateWatchlistForm({
  onSuccess,
}: {
  onSuccess?: (watchlist: unknown) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Watchlist name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await watchlistService.createWatchlist(
        name,
        description,
        isPublic
      );

      if (error) throw error;

      setName("");
      setDescription("");
      setIsPublic(false);

      if (onSuccess && data) {
        onSuccess(data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create watchlist"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Create New Watchlist</h2>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Watchlist Name *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Must Watch Shows"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this watchlist about?"
          rows={3}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center">
        <input
          id="public"
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="public" className="text-sm">
          Make this watchlist public (anyone can view)
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Watchlist"}
      </button>
    </form>
  );
}
