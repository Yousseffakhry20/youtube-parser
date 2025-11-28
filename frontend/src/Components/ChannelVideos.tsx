import React, { useState, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useQuery } from "@tanstack/react-query";
import "./ChannelVideos.css";
import { GetPaginatedVideos } from "../APIs/GetPaginatedVideos";
import { GetChannelVideos } from "../APIs/GetChannelVideos";
import type {
  ApiError,
  CategoryWithVideos,
  PaginatedVideos,
} from "../Types/Types";

const ChannelVideos: React.FC = () => {
  const [channelUrls, setChannelUrls] = useState<string[]>(["", "", ""]);
  const [categories, setCategories] = useState<CategoryWithVideos[]>([]);
  const [channelIdentifiers, setChannelIdentifiers] = useState<string[]>([]); // Store channel identifiers for pagination
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...channelUrls];
    newUrls[index] = value;
    setChannelUrls(newUrls);
  };

  const fetchChannelVideos = async () => {
    // Filter out empty URLs
    const validUrls = channelUrls.filter((url) => url.trim().length > 0);

    if (validUrls.length === 0) {
      setError("Please enter at least one channel URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await GetChannelVideos(validUrls);
      setCategories(response.categories);
      setChannelIdentifiers(response.channelIdentifiers);

      // Set the first category as active if available
      if (response.categories.length > 0) {
        setActiveCategory(response.categories[0].id);
      }
      // Reset to first page when fetching new data
      setCurrentPage(1);
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.response?.data?.error ||
          apiError.message ||
          "Failed to fetch channel videos. Please check the channel URLs and try again."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // React Query hook for fetching paginated videos
  const {
    data: paginatedVideosData,
    isLoading: isLoadingPage,
    isError,
    error: queryError,
  } = useQuery<PaginatedVideos, ApiError>({
    queryKey: [
      "paginatedVideos",
      activeCategory,
      currentPage,
      channelIdentifiers,
    ],
    queryFn: async () => {
      if (channelIdentifiers.length === 0) {
        throw new Error("No channel identifiers provided");
      }

      const params = new URLSearchParams({
        channelIdentifiers: channelIdentifiers.join(","),
        page: currentPage.toString(),
        limit: "20",
      });

      if (activeCategory) {
        params.append("categoryId", activeCategory);
      }

      const response = await GetPaginatedVideos(params);
      return response;
    },
    enabled: !!activeCategory && channelIdentifiers.length > 0, // Only run query when we have active category and channel identifiers
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Handle tab change
  const handleTabChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setCurrentPage(1); // Reset to first page when changing categories
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (
      paginatedVideosData?.pagination &&
      page >= 1 &&
      page <= paginatedVideosData.pagination.totalPages
    ) {
      setCurrentPage(page);
    }
  };

  // Handle query errors
  useEffect(() => {
    if (isError && queryError) {
      setError(
        queryError.response?.data?.error ||
          queryError.message ||
          "Failed to fetch paginated videos."
      );
    }
  }, [isError, queryError]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">YouTube Channel Video Parser</h1>

      <div className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter up to 3 YouTube Channel URLs:
          </label>
          {[0, 1, 2].map((index) => (
            <input
              key={index}
              type="text"
              value={channelUrls[index]}
              onChange={(e) => handleUrlChange(index, e.target.value)}
              placeholder={`Channel URL ${
                index + 1
              } (e.g., https://www.youtube.com/@username)`}
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2"
            />
          ))}
        </div>

        <div className="text-sm text-gray-500 mb-4">
          <p>Supported formats:</p>
          <ul className="list-disc list-inside ml-4">
            <li>
              Channel ID:
              https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw
            </li>
            <li>Username: https://www.youtube.com/@username</li>
          </ul>
        </div>

        <button
          onClick={fetchChannelVideos}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Fetch Videos from Channels"}
        </button>

        {error && <div className="mt-2 text-red-500">{error}</div>}
      </div>

      {categories.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Categorized Videos</h2>
            <span className="text-sm text-gray-500">
              {categories.reduce((sum, cat) => sum + cat.videos.length, 0)}{" "}
              total videos
            </span>
          </div>

          <Tabs.Root
            value={activeCategory || categories[0]?.id}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <Tabs.List className="flex border-b border-gray-200 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((category) => (
                <Tabs.Trigger
                  key={category.id}
                  value={category.id}
                  className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
                >
                  {category.name} ({category.videos.length})
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <Tabs.Content
              value={activeCategory || categories[0]?.id}
              className="py-4"
            >
              {/* Paginated Videos Display */}
              {isLoadingPage ? (
                <div className="text-center py-8">Loading videos...</div>
              ) : paginatedVideosData?.videos &&
                paginatedVideosData.videos.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedVideosData.videos.map((video) => (
                      <div
                        key={video.id}
                        className="border border-gray-200 rounded-md p-4"
                      >
                        <h4 className="font-medium">{video.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {video.description}
                        </p>
                        <div className="text-xs text-gray-500 mt-2">
                          Channel: {video.channelTitle}
                        </div>
                        <div className="text-xs text-gray-500">
                          Published:{" "}
                          {new Date(video.publishedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {paginatedVideosData.pagination && (
                    <div className="flex justify-center items-center mt-6 space-x-2">
                      <button
                        onClick={() =>
                          handlePageChange(
                            paginatedVideosData.pagination.currentPage - 1
                          )
                        }
                        disabled={
                          !paginatedVideosData.pagination.hasPrev ||
                          isLoadingPage
                        }
                        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                      >
                        Previous
                      </button>

                      <span className="mx-2">
                        Page {paginatedVideosData.pagination.currentPage} of{" "}
                        {paginatedVideosData.pagination.totalPages}
                      </span>

                      <button
                        onClick={() =>
                          handlePageChange(
                            paginatedVideosData.pagination.currentPage + 1
                          )
                        }
                        disabled={
                          !paginatedVideosData.pagination.hasNext ||
                          isLoadingPage
                        }
                        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No videos found for this category.
                </div>
              )}
            </Tabs.Content>
          </Tabs.Root>
        </div>
      )}
    </div>
  );
};

export default ChannelVideos;
