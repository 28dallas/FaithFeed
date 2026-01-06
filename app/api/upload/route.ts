import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    // Check if we're in production with Blob storage
    if (process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN) {
      // Production: Use Vercel Blob
      const { searchParams } = new URL(request.url)
      const filename = searchParams.get('filename')
      
      if (!filename) {
        return NextResponse.json({ error: 'Filename required' }, { status: 400 })
      }

      const blob = await put(filename, request.body, {
        access: 'public',
      })

      return NextResponse.json({ videoUrl: blob.url })
    } else {
      // Development: Use local storage
      const formData = await request.formData()
      const file = formData.get('video') as File
      
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filepath = path.join(process.cwd(), 'public/uploads', filename)
      
      await writeFile(filepath, buffer)
      return NextResponse.json({ videoUrl: `/uploads/${filename}` })
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}