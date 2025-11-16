import { NextRequest, NextResponse } from 'next/server'
import { showService } from '@/utils/services/show-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tmdbId, status } = body

    if (!tmdbId || !status) {
      return NextResponse.json(
        { error: 'tmdbId and status are required' },
        { status: 400 }
      )
    }

    const result = await showService.addToMyShows(tmdbId.toString(), status)
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error.message || 'Failed to add show' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Error adding show:', error)
    return NextResponse.json(
      { error: 'Failed to add show' },
      { status: 500 }
    )
  }
}

