import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { writeFile } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called')
    
    // Always use Vercel Blob in production
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 })
    }

    if (!request.body) {
      return NextResponse.json({ error: 'No file data' }, { status: 400 })
    }

    console.log('Uploading to Vercel Blob:', filename)
    
    const blob = await put(filename, request.body, {
      access: 'public',
    })

    console.log('Blob upload successful:', blob.url)
    return NextResponse.json({ videoUrl: blob.url })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}