import { google } from "googleapis";

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  categoryId?: string;
  tags?: string[];
}

interface YouTubeChannel {
  id: string;
  title: string;
}

export class YouTubeService {
  /**
   * Get YouTube API client
   * @returns YouTube API client instance
   */
  private getYouTubeClient() {
    return google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    });
  }

  /**
   * Resolve channel ID from username or handle
   * @param username The username or handle (e.g., "@username")
   * @returns The channel ID
   */
  async resolveChannelId(username: string): Promise<string | null> {
    try {
      const youtube = this.getYouTubeClient();

      // Remove @ symbol if present
      const cleanUsername = username.startsWith("@")
        ? username.substring(1)
        : username;

      // Try to get channel by username/handle
      const response = await youtube.channels.list({
        forHandle: cleanUsername,
        part: ["id"],
      });

      if (response.data.items && response.data.items.length > 0) {
        return response.data.items[0].id!;
      }

      // If that fails, try searching for the channel
      const searchResponse = await youtube.search.list({
        q: cleanUsername,
        type: ["channel"],
        part: ["snippet"],
        maxResults: 1,
      });

      if (searchResponse.data.items && searchResponse.data.items.length > 0) {
        // The search API returns the channel ID in a different structure
        // For channels, if id is an object, the channelId is in id.channelId
        // Otherwise, id is the channel ID directly
        const item = searchResponse.data.items[0];
        if (typeof item.id === "string") {
          return item.id;
        } else if (item.id && "channelId" in item.id) {
          return item.id.channelId!;
        }
      }

      // If we can't resolve the channel ID, return null instead of throwing an error
      console.warn(`Could not resolve channel ID for username: ${username}`);
      return null;
    } catch (error) {
      console.error("Error resolving channel ID:", error);
      // Return null instead of throwing an error
      return null;
    }
  }

  /**
   * Fetch all videos from a YouTube channel
   * @param channelIdentifier The channel ID or username (with @)
   * @returns Array of videos from the channel, or empty array if channel not found
   */
  async fetchChannelVideos(channelIdentifier: string): Promise<YouTubeVideo[]> {
    try {
      const youtube = this.getYouTubeClient();
      let channelId = channelIdentifier;

      // If it's a username (starts with @), resolve the channel ID
      if (channelIdentifier.startsWith("@")) {
        const resolvedId = await this.resolveChannelId(channelIdentifier);
        if (!resolvedId) {
          // If we can't resolve the channel ID, return empty array instead of throwing an error
          console.warn(
            `Skipping channel ${channelIdentifier} - could not resolve channel ID`
          );
          return [];
        }
        channelId = resolvedId;
      }

      // Step 1: Search channel by ID with contentDetails to fetch uploads ID
      const channelResponse = await youtube.channels.list({
        id: [channelId],
        part: ["snippet", "contentDetails"],
      });

      if (
        !channelResponse.data.items ||
        channelResponse.data.items.length === 0
      ) {
        // If channel not found, return empty array instead of throwing an error
        console.warn(`Skipping channel ${channelId} - channel not found`);
        return [];
      }

      const channel: YouTubeChannel = {
        id: channelResponse.data.items[0].id!,
        title: channelResponse.data.items[0].snippet?.title || "",
      };

      // Get uploads playlist ID from contentDetails
      const uploadsPlaylistId =
        channelResponse.data.items[0].contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) {
        // If we can't get the uploads playlist, return empty array instead of throwing an error
        console.warn(
          `Skipping channel ${channelId} - could not find uploads playlist`
        );
        return [];
      }

      // Step 2: Search playlist items with the uploads ID
      const videos: YouTubeVideo[] = [];
      let nextPageToken: string | undefined;

      do {
        const playlistResponse = await youtube.playlistItems.list({
          playlistId: uploadsPlaylistId,
          part: ["snippet", "contentDetails"],
          maxResults: 50,
          pageToken: nextPageToken,
        });

        const videoIds = playlistResponse.data.items
          ?.map((item) => item.contentDetails?.videoId)
          .filter(Boolean) as string[];

        if (videoIds.length > 0) {
          // Get detailed video information
          const videosResponse = await youtube.videos.list({
            id: videoIds,
            part: ["snippet", "contentDetails", "statistics"],
          });

          videosResponse.data.items?.forEach((video) => {
            if (video.id && video.snippet) {
              videos.push({
                id: video.id,
                title: video.snippet.title || "",
                description: video.snippet.description || "",
                publishedAt: video.snippet.publishedAt || "",
                channelId: video.snippet.channelId || "",
                channelTitle: video.snippet.channelTitle || "",
                categoryId: video.snippet.categoryId || undefined,
                tags: video.snippet.tags || [],
              });
            }
          });
        }

        nextPageToken = playlistResponse.data.nextPageToken || undefined;
      } while (nextPageToken);

      return videos;
    } catch (error) {
      console.error("Error fetching YouTube videos:", error);
      // Return empty array instead of throwing an error
      return [];
    }
  }
}
