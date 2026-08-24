import type { ScreenId } from '../types/zentry';
import { agencyService } from './agencyService';

export interface ActiveMediaItem {
  id: string;
  mediaId: string;
  title: string;
  creator: string;
  creatorAvatar?: string;
  category: string;
  type: 'youtube' | 'stream' | 'tiktok' | 'audio';
  sourceScreen: ScreenId;
  isPlaying: boolean;
  duration?: string;
}

class MediaPlaybackService {
  private currentMedia: ActiveMediaItem | null = null;
  private listeners: Array<(media: ActiveMediaItem | null) => void> = [];

  public subscribe(listener: (media: ActiveMediaItem | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentMedia);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.currentMedia ? { ...this.currentMedia } : null));
  }

  public getMedia(): ActiveMediaItem | null {
    return this.currentMedia ? { ...this.currentMedia } : null;
  }

  public playMedia(item: Omit<ActiveMediaItem, 'isPlaying'>) {
    this.currentMedia = {
      ...item,
      isPlaying: true
    };
    agencyService.onMediaStarted(item.title, item.category, item.sourceScreen);
    this.notify();
  }

  public togglePlayPause() {
    if (!this.currentMedia) return;
    this.currentMedia.isPlaying = !this.currentMedia.isPlaying;
    if (this.currentMedia.isPlaying) {
      agencyService.onMediaStarted(
        this.currentMedia.title,
        this.currentMedia.category,
        this.currentMedia.sourceScreen
      );
    } else {
      agencyService.onMediaStopped();
    }
    this.notify();
  }

  public stopMedia() {
    if (this.currentMedia) {
      agencyService.onMediaStopped();
      this.currentMedia = null;
      this.notify();
    }
  }
}

export const mediaPlaybackService = new MediaPlaybackService();
