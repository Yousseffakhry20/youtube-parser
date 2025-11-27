export interface Video {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  categoryId?: string;
  tags?: string[];
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  videoCount: number;
}

export interface CategoryWithVideos {
  id: string;
  name: string;
  videos: Video[];
}
