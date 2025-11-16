import { NextRequest, NextResponse } from 'next/server'
import { showService } from '@/utils/services/show-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { tmdbId: string } }
) {
  try {
    const show = await showService.getOrFetchShow(params.tmdbId)
    return NextResponse.json(show)
  } catch (error) {
    console.error('Error fetching show:', error)
    return NextResponse.json(
      { error: 'Failed to fetch show details' },
      { status: 500 }
    )
  }
}
