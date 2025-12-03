// MongoDB storage for videos and categories using Mongoose
import VideoModel from "./VideoSchema.js";
import { Video, CategoryWithVideos } from "./videoModelTypes.js";

class VideoStore {
  // Save a video to the database
  async saveVideo(video: Omit<Video, "createdAt">): Promise<Video> {
    const newVideo = new VideoModel({
      ...video,
      createdAt: new Date(),
    });

    return await newVideo.save();
  }

  // Save multiple videos to the database using bulkWrite to prevent duplicates
  async saveVideos(videos: Omit<Video, "createdAt">[]): Promise<Video[]> {
    const videosToSave = videos.map((video) => ({
      ...video,
      createdAt: new Date(),
    }));

    // Use bulkWrite with upsert to prevent duplicates
    const bulkOps = videosToSave.map((video) => ({
      updateOne: {
        filter: { id: video.id }, // Use YouTube video ID as the unique identifier
        update: { $set: video },
        upsert: true,
      },
    }));

    try {
      await VideoModel.bulkWrite(bulkOps, { ordered: false });
      // Since bulkWrite doesn't return the documents, we need to fetch them
      // Return the videos that were processed by querying them back
      const videoIds = videosToSave.map((video) => video.id);
      return await VideoModel.find({ id: { $in: videoIds } });
    } catch (error) {
      console.error("Error during bulk write operation:", error);
      // Fallback to insertMany if bulkWrite fails
      const insertedVideos = await VideoModel.insertMany(videosToSave, {
        ordered: false,
      });
      return insertedVideos;
    }
  }

  // Get all videos from the database with optional filtering and pagination
  async getAllVideos(options?: {
    channelTitle?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    videos: Video[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    
    // Build filter criteria
    const filter: any = {};
    
    // Add channel title filter (case-insensitive partial match)
    if (options?.channelTitle) {
      filter.channelTitle = { $regex: options.channelTitle, $options: 'i' };
    }
    
    // Add category ID filter
    if (options?.categoryId) {
      filter.categoryId = options.categoryId;
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Fetch paginated videos from database
    const videos = await VideoModel.find(filter)
      .sort({ publishedAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .exec();
    
    // Get total count for pagination info
    const totalCount = await VideoModel.countDocuments(filter).exec();
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      videos,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  // Get videos by channel ID from the database
  async getVideosByChannel(channelId: string): Promise<Video[]> {
    return await VideoModel.find({ channelId });
  }

  // Clear all videos from the database (useful for testing)
  async clearVideos(): Promise<void> {
    await VideoModel.deleteMany({});
  }

  // Create or update categories based on video data
  async categorizeVideos(videos?: Video[]): Promise<CategoryWithVideos[]> {
    // If videos are provided, categorize only those videos
    // Otherwise, get all videos from the database (for backward compatibility)
    let videosToCategorize: Video[];
    if (videos) {
      videosToCategorize = videos;
    } else {
      const result = await this.getAllVideos();
      videosToCategorize = result.videos;
    }

    const categoryMap: Record<string, CategoryWithVideos> = {};

    videosToCategorize.forEach((video) => {
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
