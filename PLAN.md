# FaithFeed Video Sharing Fix Plan

## Problem Identified
- **Issue**: Videos posted by one user are not visible to other users on different devices
- **Root Cause**: Using file-based storage (`/data/videos.json`) which doesn't work on Vercel deployments
  - Vercel has ephemeral file system (files cannot be permanently written)
  - Each server request may hit different server instance
  - File writes are not persisted across sessions/devices

## Solution: Vercel KV (Redis) Integration

### Step 1: Set Up Vercel KV Database
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Create KV database: `vercel kv database create`
- [ ] Link project: `vercel link`
- [ ] Add environment variables to Vercel dashboard

### Step 2: Update Dependencies
- [ ] Install Redis client: `npm install @vercel/kv`

### Step 3: Update API Route (`app/api/videos/route.ts`)
- [ ] Replace file system operations with Redis operations
- [ ] Implement `readData()` using Redis
- [ ] Implement `writeData()` using Redis
- [ ] Maintain same API interface for backward compatibility

### Step 4: Test Data Persistence
- [ ] Test video upload on one device
- [ ] Verify video appears on different device
- [ ] Test multiple video uploads
- [ ] Test video deletion

### Step 5: Deploy and Verify
- [ ] Deploy changes to Vercel
- [ ] Test cross-device video visibility
- [ ] Monitor performance

## Implementation Details

### New API Route Structure
```typescript
// app/api/videos/route.ts
import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function GET() {
  const videos = await kv.get('faithfeed_videos') || []
  return NextResponse.json(videos)
}

export async function POST(request: Request) {
  const body = await request.json()
  const videos = await kv.get('faithfeed_videos') || []
  
  const newVideo = { ...body, createdAt: Date.now() }
  const updated = [newVideo, ...videos]
  
  await kv.set('faithfeed_videos', updated)
  await kv.set(`video:${body.id}`, newVideo)
  
  return NextResponse.json(newVideo, { status: 201 })
}
```

### Frontend Changes
- **No changes needed** to upload page - it already calls `/api/videos`
- **No changes needed** to feed pages - they already fetch from `/api/videos`
- Redis provides instant cross-device synchronization

## Estimated Time
- Setup: 5-10 minutes
- Implementation: 10-15 minutes  
- Testing: 5-10 minutes
- **Total: ~30 minutes**

## Success Criteria
✅ Videos uploaded by admin appear to all users on all devices  
✅ Videos persist after page refresh  
✅ Videos persist after server restarts  
✅ Cross-device synchronization works instantly
