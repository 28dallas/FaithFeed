import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 })
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'Blob storage not configured' }, { status: 500 })
    }

    console.log('Generating upload URL for:', filename)

    // Generate a presigned upload URL
    const blob = await put(filename, new Blob(), {
      access: 'public',
      handleUploadUrl: 'client',
      addRandomSuffix: false,
    })

    return NextResponse.json({ 
      uploadUrl: blob.uploadUrl,
      downloadUrl: blob.url 
    })
  } catch (error) {
    console.error('Upload URL error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate upload URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}