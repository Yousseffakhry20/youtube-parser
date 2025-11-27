import { Request, Response } from "express";
import { YouTubeService, YouTubeVideo } from "../services/youtubeService.js";
import { videoStore } from "../models/videoModel.js";

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
      const channelIdentifiers = urls.map((url) => {
        const identifier = this.extractChannelIdentifier(url);
        if (!identifier) {
          throw new Error(`Invalid YouTube channel URL: ${url}`);
        }
        return identifier;
      });

      // Fetch videos from all channels
      const allVideos: YouTubeVideo[] = [];
      for (const identifier of channelIdentifiers) {
        const videos = await youtubeService.fetchChannelVideos(identifier);
        allVideos.push(...videos);
      }

      // Convert YouTube videos to our video model (without createdAt)
      const videosToSave = allVideos.map((video: YouTubeVideo) => ({
        id: video.id,
        title: video.title,
        description: video.description,
        publishedAt: video.publishedAt,
        channelId: video.channelId,
        channelTitle: video.channelTitle,
        categoryId: video.categoryId,
        tags: video.tags,
      }));

      // Save videos to our store
      const savedVideos = videoStore.saveVideos(videosToSave);

      // Categorize the videos
      const categorizedVideos = videoStore.categorizeVideos(savedVideos);

      // Return the categorized videos
      return res.json({
        categories: categorizedVideos,
      });
    } catch (error) {
      console.error("Error processing multiple channel videos:", error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  /**
   * Fetch videos from a single YouTube channel (kept for backward compatibility)
   */
  async getChannelVideos(req: Request, res: Response) {
    try {
      const { channelUrl } = req.query;

      // Validate input
      if (!channelUrl || typeof channelUrl !== "string") {
        return res.status(400).json({
          error: "Missing required query parameter: channelUrl",
        });
      }

      // Extract channel identifier from URL
      const channelIdentifier = this.extractChannelIdentifier(channelUrl);

      if (!channelIdentifier) {
        return res.status(400).json({
          error:
            "Invalid YouTube channel URL. Please provide a valid channel URL.",
        });
      }

      // Fetch videos from YouTube
      const youtubeVideos = await youtubeService.fetchChannelVideos(
        channelIdentifier
      );

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

      // Save videos to our store
      const savedVideos = videoStore.saveVideos(videosToSave);

      // Categorize the videos
      const categorizedVideos = videoStore.categorizeVideos(savedVideos);

      // Return the categorized videos
      return res.json({
        categories: categorizedVideos,
      });
    } catch (error) {
      console.error("Error processing channel videos:", error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
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
   * Get all videos stored in the database
   */
  async getAllVideos(req: Request, res: Response) {
    try {
      const videos = videoStore.getAllVideos();
      return res.json({ videos });
    } catch (error) {
      console.error("Error fetching videos:", error);
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }
}
