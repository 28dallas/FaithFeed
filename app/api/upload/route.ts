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

    // Check file size (100MB limit for Vercel)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 100MB allowed.' }, { status: 400 })
    }

    // Use Vercel Blob in production, local storage in development
    if (process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN !== 'your_blob_token_here') {
      try {
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const blob = await put(filename, file, {
          access: 'public',
        })
        return NextResponse.json({ videoUrl: blob.url }, { status: 200 })
      } catch (blobError) {
        console.error('Blob upload failed:', blobError)
        return NextResponse.json({ error: 'Blob upload failed' }, { status: 500 })
      }
    } else {
      // Local development - save to public/uploads
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const filepath = path.join(process.cwd(), 'public/uploads', filename)
        
        await writeFile(filepath, buffer)
        return NextResponse.json({ videoUrl: `/uploads/${filename}` }, { status: 200 })
      } catch (localError) {
        console.error('Local upload failed:', localError)
        return NextResponse.json({ error: 'Local upload failed' }, { status: 500 })
      }
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}