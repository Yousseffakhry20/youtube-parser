import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { GetAllVideos } from "../APIs/GetAllVideos";
import VideoCard from "../Components/VideoCard";
import PaginationControls from "../Components/PaginationControls";
import type { PaginatedVideos, ApiError } from "../Types/Types";

// Category mapping from backend
const CATEGORIES = [
  { id: "", name: "All Categories" },
  { id: "1", name: "Film & Animation" },
  { id: "2", name: "Autos & Vehicles" },
  { id: "10", name: "Music" },
  { id: "15", name: "Pets & Animals" },
  { id: "17", name: "Sports" },
  { id: "20", name: "Gaming" },
  { id: "22", name: "People & Blogs" },
  { id: "23", name: "Comedy" },
  { id: "24", name: "Entertainment" },
  { id: "25", name: "News & Politics" },
  { id: "26", name: "Howto & Style" },
  { id: "27", name: "Education" },
  { id: "28", name: "Science & Technology" },
  { id: "29", name: "Nonprofits & Activism" },
];

const AllVideos: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Fetch videos with filters
  const {
    data: videosData,
    isLoading,
    isError,
    error,
  } = useQuery<PaginatedVideos, ApiError>({
    queryKey: ["allVideos", debouncedSearchTerm, selectedCategory, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (debouncedSearchTerm.trim()) {
        params.append("channelTitle", debouncedSearchTerm.trim());
      }

      if (selectedCategory) {
        params.append("categoryId", selectedCategory);
      }

      return await GetAllVideos(params);
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const handlePageChange = (page: number) => {
    if (
      videosData?.pagination &&
      page >= 1 &&
      page <= videosData.pagination.totalPages
    ) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Videos</h1>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by Channel Name
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter channel name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filters Display */}
        {(debouncedSearchTerm || selectedCategory) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Active filters:</span>
            {debouncedSearchTerm && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                Channel: {debouncedSearchTerm}
              </span>
            )}
            {selectedCategory && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                Category:{" "}
                {CATEGORIES.find((c) => c.id === selectedCategory)?.name}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
              }}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {isError && error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error.response?.data?.error || error.message || "Failed to fetch videos"}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading videos...</p>
        </div>
      )}

      {/* Videos Display */}
      {!isLoading && videosData && (
        <>
          {/* Video Count */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {videosData.videos.length} of {videosData.pagination.totalCount} videos
          </div>

          {/* Videos Grid */}
          {videosData.videos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videosData.videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>

              {/* Pagination */}
              {videosData.pagination.totalPages > 1 && (
                <PaginationControls
                  pagination={videosData.pagination}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No videos found</p>
              <p className="text-sm mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllVideos;