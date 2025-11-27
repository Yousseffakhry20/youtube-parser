import { Router } from "express";
import { ChannelController } from "../controllers/channelController.js";

const router = Router();
const channelController = new ChannelController();

/**
 * @route GET /api/channel/videos
 * @desc Fetch all videos from a YouTube channel (backward compatibility)
 * @param {string} channelUrl - The URL of the YouTube channel
 * @returns {object} Categories with their videos
 */
router.get("/api/channel/videos", (req, res) =>
  channelController.getChannelVideos(req, res)
);

/**
 * @route GET /api/channels/videos
 * @desc Fetch all videos from multiple YouTube channels
 * @param {string} channelUrls - Comma-separated URLs of YouTube channels (max 3)
 * @returns {object} Categories with their videos
 */
router.get("/api/channels/videos", (req, res) =>
  channelController.getMultipleChannelVideos(req, res)
);

/**
 * @route GET /api/channels/paginated-videos
 * @desc Get paginated videos for specific channels and category
 * @param {string} channelIdentifiers - Comma-separated channel identifiers
 * @param {string} categoryId - Category ID to filter by (optional)
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Number of items per page (default: 20, max: 100)
 * @returns {object} Paginated videos with pagination metadata
 */
router.get("/api/channels/paginated-videos", (req, res) =>
  channelController.getPaginatedVideos(req, res)
);

/**
 * @route GET /api/videos
 * @desc Get all videos stored in the database
 * @returns {object} All videos
 */
router.get("/api/videos", (req, res) =>
  channelController.getAllVideos(req, res)
);

export default router;
