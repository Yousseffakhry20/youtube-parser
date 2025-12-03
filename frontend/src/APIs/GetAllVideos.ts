import axios from "axios";
import type { PaginatedVideos } from "../Types/Types";

const BaseURL = import.meta.env.VITE_API_URL;

export const GetAllVideos = async (params: URLSearchParams) => {
  const response = await axios.get<PaginatedVideos>(
    `${BaseURL}/api/videos?${params.toString()}`
  );

  return response.data;
};
