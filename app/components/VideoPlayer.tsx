'use client'

import { Play, Pause, Volume2, VolumeX, Settings, Maximize } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface VideoPlayerProps {
  src: string
  className?: string
  onPlay?: () => void
  onPause?: () => void
}

export default function VideoPlayer({ src, className, onPlay, onPause }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showControls, setShowControls] = useState(false)
  const [showQuality, setShowQuality] = useState(false)
  const [quality, setQuality] = useState('720p')
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const qualities = [
    { label: '1080p', value: '1080p' },
    { label: '720p', value: '720p' },
    { label: '480p', value: '480p' },
    { label: '360p', value: '360p' }
  ]

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100)
      }
    }

    const updateDuration = () => {
      setDuration(video.duration)
    }

    video.addEventListener('timeupdate', updateProgress)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('play', () => {
      setIsPlaying(true)
      onPlay?.()
    })
    video.addEventListener('pause', () => {
      setIsPlaying(false)
      onPause?.()
    })

    return () => {
      video.removeEventListener('timeupdate', updateProgress)
      video.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [onPlay, onPause])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    video.currentTime = newTime
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div 
      className={`relative group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        setShowControls(false)
        setShowQuality(false)
      }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        onClick={togglePlay}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          {/* Center Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="bg-black bg-opacity-50 text-white p-4 rounded-full hover:bg-opacity-70 transition-opacity"
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          </button>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            {/* Progress Bar */}
            <div 
              className="w-full h-1 bg-white bg-opacity-30 rounded-full cursor-pointer mb-3"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-gray-300"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-gray-300"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <span className="text-white text-sm">
                  {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {/* Quality Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowQuality(!showQuality)}
                    className="text-white hover:text-gray-300 flex items-center space-x-1"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="text-sm">{quality}</span>
                  </button>

                  {showQuality && (
                    <div className="absolute bottom-8 right-0 bg-black bg-opacity-80 rounded-lg p-2 min-w-20">
                      {qualities.map((q) => (
                        <button
                          key={q.value}
                          onClick={() => {
                            setQuality(q.value)
                            setShowQuality(false)
                          }}
                          className={`block w-full text-left px-3 py-1 text-sm rounded hover:bg-white hover:bg-opacity-20 ${
                            quality === q.value ? 'text-blue-400' : 'text-white'
                          }`}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button className="text-white hover:text-gray-300">
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}