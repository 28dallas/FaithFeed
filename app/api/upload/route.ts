import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('video') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Use Vercel Blob in production, local storage in development
    if (process.env.VERCEL) {
      const blob = await put(file.name, file, {
        access: 'public',
      })
      return NextResponse.json({ videoUrl: blob.url }, { status: 200 })
    } else {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const filename = `${Date.now()}-${file.name}`
      const filepath = path.join(process.cwd(), 'public/uploads', filename)
      
      await writeFile(filepath, buffer)
      return NextResponse.json({ videoUrl: `/uploads/${filename}` }, { status: 200 })
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}