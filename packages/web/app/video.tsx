import { useState } from 'react';
import { VideoPlayer, VideoControls, MediaTimeline, useVideoPlayer } from '~/features/video';
import type { VideoProject, MediaItem, Subtitle } from '~/features/video';

export function VideoRoute() {
  const [project, setProject] = useState<VideoProject>({
    id: 'default-project',
    title: 'New Video Project',
    mediaItems: [],
    subtitles: [],
    settings: {
      width: 800,
      height: 600,
      fps: 30,
      backgroundColor: '#000000',
    },
  });

  const {
    canvasRef,
    playbackState,
    play,
    pause,
    seek,
    setSpeed,
    getCurrentMediaItem,
    getCurrentSubtitles,
  } = useVideoPlayer(project);

  const handleAddMediaItem = (newItem: Omit<MediaItem, 'id'>) => {
    const mediaItem: MediaItem = {
      ...newItem,
      id: Date.now().toString(),
    };
    
    setProject(prev => ({
      ...prev,
      mediaItems: [...prev.mediaItems, mediaItem],
    }));
  };

  const handleRemoveMediaItem = (id: string) => {
    setProject(prev => ({
      ...prev,
      mediaItems: prev.mediaItems.filter(item => item.id !== id),
    }));
  };

  const handleAddSubtitle = (newSubtitle: Omit<Subtitle, 'id'>) => {
    const subtitle: Subtitle = {
      ...newSubtitle,
      id: Date.now().toString(),
    };
    
    setProject(prev => ({
      ...prev,
      subtitles: [...prev.subtitles, subtitle],
    }));
  };

  const handleRemoveSubtitle = (id: string) => {
    setProject(prev => ({
      ...prev,
      subtitles: prev.subtitles.filter(subtitle => subtitle.id !== id),
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Video Editor</h1>
        <p className="text-muted-foreground">
          Create slideshows with images, videos, and subtitles on canvas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div className="border border-border rounded-lg bg-background p-4">
              <canvas
                ref={canvasRef}
                width={project.settings.width}
                height={project.settings.height}
                className="border border-border rounded-lg bg-background w-full max-w-full h-auto"
              />
            </div>
            
            {/* Video Controls */}
            <VideoControls
              playbackState={playbackState}
              onPlay={play}
              onPause={pause}
              onSeek={seek}
              onSpeedChange={setSpeed}
            />
          </div>
        </div>

        {/* Timeline Panel */}
        <div className="lg:col-span-1">
          <MediaTimeline
            mediaItems={project.mediaItems}
            subtitles={project.subtitles}
            currentTime={playbackState.currentTime}
            currentMediaIndex={playbackState.currentMediaIndex}
            onAddMediaItem={handleAddMediaItem}
            onRemoveMediaItem={handleRemoveMediaItem}
            onAddSubtitle={handleAddSubtitle}
            onRemoveSubtitle={handleRemoveSubtitle}
          />
        </div>
      </div>

      {/* Quick Start Instructions */}
      {project.mediaItems.length === 0 && (
        <div className="mt-12 text-center">
          <div className="bg-muted p-8 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Get Started</h2>
            <div className="text-left space-y-2 text-sm text-muted-foreground">
              <p>1. Click "Add Media" to upload images or videos</p>
              <p>2. Add subtitles by typing text and clicking "Add"</p>
              <p>3. Use the playback controls to preview your slideshow</p>
              <p>4. Adjust timing and positioning as needed</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoRoute;