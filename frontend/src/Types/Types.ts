export interface Video {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  categoryId?: string;
  tags?: string[];
  createdAt: string;
}

export interface CategoryWithVideos {
  id: string;
  name: string;
  videos: Video[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedVideos {
  videos: Video[];
  pagination: PaginationInfo;
}

export interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}
