import axios from "axios";
import type { PaginatedVideos } from "../Types/Types";

const BaseURL = import.meta.env.VITE_API_URL;
console.log(BaseURL);

export const GetPaginatedVideos = async (params: URLSearchParams) => {
  const response = await axios.get<PaginatedVideos>(
    `${BaseURL}/api/channels/paginated-videos?${params.toString()}`
  );

  return response.data;
};
