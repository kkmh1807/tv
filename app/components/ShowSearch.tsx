'use client'

import { useState } from 'react'
import { TMDBShow } from '@/types/tmdb'

export function ShowSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TMDBShow[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/shows/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddShow = async (tmdbId: number, status: 'watching' | 'plan_to_watch') => {
    try {
      const response = await fetch('/api/shows/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tmdbId: tmdbId.toString(), status }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add show')
      }

    } catch (error) {
      console.error('Failed to add show:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for TV shows..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((show) => (
          <div key={show.id} className="border rounded-lg overflow-hidden shadow-lg">
            {show.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                alt={show.name}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{show.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {show.overview}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddShow(show.id, 'watching')}
                  className="flex-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Watching
                </button>
                <button
                  onClick={() => handleAddShow(show.id, 'plan_to_watch')}
                  className="flex-1 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Plan to Watch
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}