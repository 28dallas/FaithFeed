import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data', 'videos.json')

async function readData() {
  try {
    const content = await fs.readFile(DATA_PATH, 'utf8')
    return JSON.parse(content || '[]')
  } catch (err) {
    return []
  }
}

async function writeData(data: any) {
  await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true })
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8')
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const videos = await readData()
    
    const updatedVideos = videos.map((video: any) => {
      if (video.id === body.id) {
        return { ...video, ...body }
      }
      return video
    })
    
    await writeData(updatedVideos)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Update failed' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '0')
    
    const videos = await readData()
    const updatedVideos = videos.filter((video: any) => video.id !== id)
    
    await writeData(updatedVideos)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 400 })
  }
}