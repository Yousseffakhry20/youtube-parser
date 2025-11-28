import axios from "axios";
import type { CategoryWithVideos } from "../Types/Types";

const BaseURL = process.env.REACT_APP_API_URL;

export const GetChannelVideos = async (validUrls: string[]) => {
  const response = await axios.get<{
    categories: CategoryWithVideos[];
    channelIdentifiers: string[];
  }>(
    `${BaseURL}/api/channels/videos?channelUrls=${encodeURIComponent(
      validUrls.join(",")
    )}`
  );

  return response.data;
};
