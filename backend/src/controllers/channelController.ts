import { Request, Response } from "express";
import { YouTubeService, YouTubeVideo } from "../services/youtubeService.js";
import { videoStore } from "../models/videoModel.js";
import { Video } from "../models/videoModelTypes.js";
import VideoModel from "../models/VideoSchema.js";

const youtubeService = new YouTubeService();

export class ChannelController {
  /**
   * Fetch videos from multiple YouTube channels, save them to the database,
   * categorize them, and return categories with their videos
   */
  async getMultipleChannelVideos(req: Request, res: Response) {
    try {
      const { channelUrls } = req.query;

      // Validate input
      if (!channelUrls) {
        return res.status(400).json({
          error: "Missing required query parameter: channelUrls",
        });
      }

      // Parse channel URLs - could be a single URL or multiple URLs separated by commas
      let urls: string[] = [];
      if (typeof channelUrls === "string") {
        urls = channelUrls
          .split(",")
          .map((url) => url.trim())
          .filter((url) => url.length > 0);
      } else if (Array.isArray(channelUrls)) {
        urls = channelUrls
          .map((url) => String(url).trim())
          .filter((url) => url.length > 0);
      }

      if (urls.length === 0) {
        return res.status(400).json({
          error: "No valid channel URLs provided",
        });
      }

      if (urls.length > 3) {
        return res.status(400).json({
          error: "Maximum of 3 channel URLs allowed",
        });
      }

      // Extract channel identifiers from URLs
      const channelIdentifiers = urls
        .map((url) => {
          const identifier = this.extractChannelIdentifier(url);
          if (!identifier) {
            console.warn(`Invalid YouTube channel URL: ${url}`);
            return null;
          }
          return identifier;
        })
        .filter(Boolean) as string[]; // Filter out null values

      if (channelIdentifiers.length === 0) {
        return res.status(400).json({
          error: "No valid channel URLs provided",
        });
      }

      // Fetch videos from all channels in parallel for better performance
      const videoPromises = channelIdentifiers.map(identifier => 
        youtubeService.fetchChannelVideos(identifier)
      );
      
      const videoArrays = await Promise.all(videoPromises);
      const allVideos = videoArrays.flat();

      // Check if we got any videos at all
      if (allVideos.length === 0) {
        return res.status(404).json({
          error: "No videos found for any of the provided channels",
        });
      }

      // Transform and categorize videos using helper method
      const result = await this.transformAndCategorizeVideos(
        allVideos,
        channelIdentifiers
      );

      return res.json(result);
    } catch (error) {
      console.error("Error processing multiple channel videos:", error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

 

  /**
   * Get paginated videos for specific channels and category
   * @param req Request object with query parameters: channelIdentifiers, categoryId, page, limit
   * @param res Response object
   */
  async getPaginatedVideos(req: Request, res: Response) {
    try {
      const {
        channelIdentifiers,
        categoryId,
        page = "1",
        limit = "20",
      } = req.query;

      // Validate inputs
      if (!channelIdentifiers) {
        return res.status(400).json({
          error: "Missing required query parameter: channelIdentifiers",
        });
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          error: "Invalid page number. Must be a positive integer.",
        });
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          error: "Invalid limit. Must be between 1 and 100.",
        });
      }

      // Parse channel identifiers
      let channelIds: string[] = [];
      if (typeof channelIdentifiers === "string") {
        channelIds = channelIdentifiers
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id.length > 0);
      } else if (Array.isArray(channelIdentifiers)) {
        channelIds = channelIdentifiers
          .map((id) => String(id).trim())
          .filter((id) => id.length > 0);
      }

      if (channelIds.length === 0) {
        return res.status(400).json({
          error: "No valid channel identifiers provided",
        });
      }

      // Resolve @username handles to actual channel IDs
      const resolvedChannelIds: string[] = [];
      for (const identifier of channelIds) {
        if (identifier.startsWith("@")) {
          // This is a username/handle, resolve it to channel ID
          const channelId = await youtubeService.resolveChannelId(identifier);
          if (channelId) {
            resolvedChannelIds.push(channelId);
          } else {
            console.warn(
              `Could not resolve channel ID for handle: ${identifier}`
            );
          }
        } else {
          // This is already a channel ID
          resolvedChannelIds.push(identifier);
        }
      }

      if (resolvedChannelIds.length === 0) {
        return res.status(400).json({
          error: "No valid channel IDs could be resolved",
        });
      }

      // Build filter criteria
      const filter: any = {
        channelId: { $in: resolvedChannelIds },
      };

      // Add category filter if provided
      if (categoryId && typeof categoryId === "string") {
        filter.categoryId = categoryId;
      }

      // Calculate skip value for pagination
      const skip = (pageNum - 1) * limitNum;

      // Fetch paginated videos from database
      const videos = await VideoModel.find(filter)
        .sort({ publishedAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limitNum)
        .exec();

      // Get total count for pagination info
      const totalCount = await VideoModel.countDocuments(filter).exec();

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limitNum);

      return res.json({
        videos,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
      });
    } catch (error) {
      console.error("Error fetching paginated videos:", error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  /**
   * Helper method to transform YouTube videos and categorize them
   * Reduces code duplication between getMultipleChannelVideos and getChannelVideos
   */
  private async transformAndCategorizeVideos(
    youtubeVideos: YouTubeVideo[],
    channelIdentifiers: string[]
  ) {
    // Convert YouTube videos to our video model (without createdAt)
    const videosToSave = youtubeVideos.map((video: YouTubeVideo) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      publishedAt: video.publishedAt,
      channelId: video.channelId,
      channelTitle: video.channelTitle,
      categoryId: video.categoryId,
      tags: video.tags,
    }));

    // Save videos to our database
    const savedVideos = await videoStore.saveVideos(videosToSave);

    // Convert saved videos to the format expected by categorizeVideos
    const videosForCategorization: Video[] = savedVideos.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      publishedAt: video.publishedAt,
      channelId: video.channelId,
      channelTitle: video.channelTitle,
      categoryId: video.categoryId,
      tags: video.tags,
      createdAt: video.createdAt,
    }));

    // Categorize ONLY the newly fetched videos, not all videos in the database
    const categorizedVideos = await videoStore.categorizeVideos(
      videosForCategorization
    );

    return {
      categories: categorizedVideos,
      channelIdentifiers,
    };
  }

  /**
   * Extract channel identifier from various YouTube channel URL formats
   * Supports:
   * - https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw
   * - https://www.youtube.com/@username
   */
  private extractChannelIdentifier(url: string): string | null {
    try {
      const parsedUrl = new URL(url);

      // Check if it's a YouTube URL
      if (
        parsedUrl.hostname !== "www.youtube.com" &&
        parsedUrl.hostname !== "youtube.com"
      ) {
        return null;
      }

      // Handle channel URL format: /channel/UC_x5XG1OV2P6uZZ5FSM9Ttw
      if (parsedUrl.pathname.startsWith("/channel/")) {
        const channelId = parsedUrl.pathname.split("/")[2];
        return channelId || null;
      }

      // Handle handle URL format: /@username
      if (parsedUrl.pathname.startsWith("/@")) {
        const username = parsedUrl.pathname.substring(1); // Remove the leading slash
        return username || null;
      }

      return null;
    } catch (error) {
      // Invalid URL
      return null;
    }
  }

  /**
   * Get all videos stored in the database with optional filtering and pagination
   */
  async getAllVideos(req: Request, res: Response) {
    try {
      const {
        channelTitle,
        categoryId,
        page = "1",
        limit = "20",
      } = req.query;

      // Validate pagination parameters
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          error: "Invalid page number. Must be a positive integer.",
        });
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          error: "Invalid limit. Must be between 1 and 100.",
        });
      }

      // Build options object for filtering and pagination
      const options: {
        channelTitle?: string;
        categoryId?: string;
        page: number;
        limit: number;
      } = {
        page: pageNum,
        limit: limitNum,
      };

      // Add optional filters
      if (channelTitle && typeof channelTitle === "string") {
        options.channelTitle = channelTitle;
      }

      if (categoryId && typeof categoryId === "string") {
        options.categoryId = categoryId;
      }

      const result = await videoStore.getAllVideos(options);
      return res.json(result);
    } catch (error) {
      console.error("Error fetching videos:", error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }
}
