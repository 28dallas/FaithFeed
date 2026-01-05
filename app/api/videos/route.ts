import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data', 'videos.json')

async function readData() {
  try {
    const content = await fs.readFile(DATA_PATH, 'utf8')
    return JSON.parse(content || '[]')
  } catch (err) {
    // If file doesn't exist or is invalid, return empty array
    return []
  }
}

async function writeData(data: any) {
  await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true })
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8')
}

export async function GET() {
  const videos = await readData()
  return NextResponse.json(videos)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const videos = await readData()

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
      topic: body.topic || null
    }

    const updated = [newVideo, ...videos]
    await writeData(updated)

    return NextResponse.json(newVideo, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
