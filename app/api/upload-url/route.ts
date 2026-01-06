import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 })
    }

    // Generate a presigned upload URL
    const blob = await put(filename, new Blob(), {
      access: 'public',
      handleUploadUrl: 'client'
    })

    return NextResponse.json({ uploadUrl: blob.uploadUrl })
  } catch (error) {
    console.error('Upload URL error:', error)
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
  }
}