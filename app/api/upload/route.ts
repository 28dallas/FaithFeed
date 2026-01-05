import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('video') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Check file size (limit to 10MB for base64)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Please use a video under 10MB.' 
      }, { status: 400 })
    }

    // Convert to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const mimeType = file.type || 'video/mp4'
    const videoUrl = `data:${mimeType};base64,${base64}`
    
    return NextResponse.json({ videoUrl }, { status: 200 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}