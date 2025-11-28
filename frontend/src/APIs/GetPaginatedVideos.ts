import axios from "axios";
import type { PaginatedVideos } from "../Types/Types";

const BaseURL = process.env.REACT_APP_API_URL;
console.log(BaseURL);

export const GetPaginatedVideos = async (params: URLSearchParams) => {
  const response = await axios.get<PaginatedVideos>(
    `${BaseURL}api/channels/paginated-videos?${params.toString()}`
  );

  return response.data;
};
