import { NextRequest, NextResponse } from 'next/server'
import { tmdb } from '@/utils/tmdb/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const page = searchParams.get('page') || '1'

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    const results = await tmdb.searchShows(query, parseInt(page))
    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search shows' },
      { status: 500 }
    )
  }
}