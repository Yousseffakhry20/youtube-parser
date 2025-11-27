// Simple in-memory storage for videos and categories
// This can be replaced with a proper database later

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

class VideoStore {
  private videos: Video[] = [];
  private categories: Category[] = [];

  // Save a video to the store
  saveVideo(video: Omit<Video, "createdAt">): Video {
    const newVideo: Video = {
      ...video,
      createdAt: new Date(),
    };

    this.videos.push(newVideo);
    return newVideo;
  }

  // Save multiple videos to the store
  saveVideos(videos: Omit<Video, "createdAt">[]): Video[] {
    return videos.map((video) => this.saveVideo(video));
  }

  // Get all videos
  getAllVideos(): Video[] {
    return [...this.videos];
  }

  // Get videos by channel ID
  getVideosByChannel(channelId: string): Video[] {
    return this.videos.filter((video) => video.channelId === channelId);
  }

  // Clear all videos (useful for testing)
  clearVideos(): void {
    this.videos = [];
  }

  // Create or update categories based on video data
  categorizeVideos(videos: Video[]): CategoryWithVideos[] {
    const categoryMap: Record<string, CategoryWithVideos> = {};
    // console.log(videos);

    videos.forEach((video) => {
      // For simplicity, we'll use the YouTube category ID as our category
      // In a real application, you might want to use tags or NLP to categorize
      const categoryName = video.categoryId || "Uncategorized";

      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
          id: categoryName,
          name: this.getCategoryName(categoryName),
          videos: [],
        };
      }

      categoryMap[categoryName].videos.push(video);
    });

    // Convert to array and sort by video count
    return Object.values(categoryMap)
      .map((category) => ({
        ...category,
        videos: [...category.videos],
      }))
      .sort((a, b) => b.videos.length - a.videos.length);
  }

  // Map YouTube category IDs to human-readable names
  private getCategoryName(categoryId: string): string {
    const categoryMap: Record<string, string> = {
      "1": "Film & Animation",
      "2": "Autos & Vehicles",
      "10": "Music",
      "15": "Pets & Animals",
      "17": "Sports",
      "18": "Short Movies",
      "19": "Travel & Events",
      "20": "Gaming",
      "21": "Videoblogging",
      "22": "People & Blogs",
      "23": "Comedy",
      "24": "Entertainment",
      "25": "News & Politics",
      "26": "Howto & Style",
      "27": "Education",
      "28": "Science & Technology",
      "29": "Nonprofits & Activism",
      "30": "Movies",
      "31": "Anime/Animation",
      "32": "Action/Adventure",
      "33": "Classics",
      "34": "Comedy",
      "35": "Documentary",
      "36": "Drama",
      "37": "Family",
      "38": "Foreign",
      "39": "Horror",
      "40": "Sci-Fi/Fantasy",
      "41": "Thriller",
      "42": "Shorts",
      "43": "Shows",
      "44": "Trailers",
    };

    return categoryMap[categoryId] || `Category ${categoryId}`;
  }
}

// Export a singleton instance
export const videoStore = new VideoStore();
