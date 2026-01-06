import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('Upload request received')
    const formData = await request.formData()
    const file = formData.get('video') as File
    
    if (!file) {
      console.error('No file in request')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log('File received:', file.name, 'Size:', file.size)

    // Check file size (100MB limit for Vercel)
    if (file.size > 100 * 1024 * 1024) {
      console.error('File too large:', file.size)
      return NextResponse.json({ error: 'File too large. Max 100MB allowed.' }, { status: 400 })
    }

    // Use Vercel Blob in production, local storage in development
    if (process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN !== 'your_blob_token_here') {
      console.log('Using Vercel Blob storage')
      try {
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        console.log('Uploading to blob:', filename)
        const blob = await put(filename, file, {
          access: 'public',
        })
        console.log('Blob upload successful:', blob.url)
        return NextResponse.json({ videoUrl: blob.url }, { status: 200 })
      } catch (blobError) {
        console.error('Blob upload failed:', blobError)
        return NextResponse.json({ 
          error: 'Blob upload failed', 
          details: blobError instanceof Error ? blobError.message : 'Unknown blob error'
        }, { status: 500 })
      }
    } else {
      console.log('Using local storage')
      // Local development - save to public/uploads
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const filepath = path.join(process.cwd(), 'public/uploads', filename)
        
        await writeFile(filepath, buffer)
        console.log('Local upload successful:', filename)
        return NextResponse.json({ videoUrl: `/uploads/${filename}` }, { status: 200 })
      } catch (localError) {
        console.error('Local upload failed:', localError)
        return NextResponse.json({ 
          error: 'Local upload failed', 
          details: localError instanceof Error ? localError.message : 'Unknown local error'
        }, { status: 500 })
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