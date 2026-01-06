import { NextResponse } from 'next/server'

// In-memory storage for demo (replace with database in production)
let videos: any[] = []

export async function GET() {
  return NextResponse.json(videos)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newVideo = {
      id: body.id || Date.now(),
      creator: body.creator || 'Unknown',
      handle: body.handle || '',
      title: body.title || '',
      caption: body.caption || '',
      likes: body.likes || 0,
      comments: body.comments || [],
      shares: body.shares || 0,
      videoUrl: body.videoUrl || '',
      isLiked: body.isLiked || false,
      category: body.category || 'Sermon',
      duration: body.duration || 0,
      views: body.views || 0,
      isSaved: body.isSaved || false,
      pastorId: body.pastorId || null,
      topic: body.topic || null,
      createdAt: new Date().toISOString()
    }

    videos.unshift(newVideo)
    console.log('Video added:', newVideo.title)

    return NextResponse.json(newVideo, { status: 201 })
  } catch (err) {
    console.error('Video creation error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
