import React, { useState } from "react";
import axios from "axios";
import * as Tabs from "@radix-ui/react-tabs";
import "./ChannelVideos.css";

interface Video {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  categoryId?: string;
  tags?: string[];
  createdAt: string;
}

interface CategoryWithVideos {
  id: string;
  name: string;
  videos: Video[];
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}

const ChannelVideos: React.FC = () => {
  const [channelUrls, setChannelUrls] = useState<string[]>(["", "", ""]);
  const [categories, setCategories] = useState<CategoryWithVideos[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...channelUrls];
    newUrls[index] = value;
    setChannelUrls(newUrls);
  };

  const fetchChannelVideos = async () => {
    // Filter out empty URLs
    const validUrls = channelUrls.filter((url) => url.trim().length > 0);

    if (validUrls.length === 0 || validUrls.length < 3) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get<{ categories: CategoryWithVideos[] }>(
        `http://localhost:4000/api/channels/videos?channelUrls=${encodeURIComponent(
          validUrls.join(",")
        )}`
      );
      setCategories(response.data.categories);
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
          {loading ? "Loading..." : "Fetch Videos from All Channels"}
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

          <Tabs.Root defaultValue={categories[0]?.id} className="w-full">
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

            {categories.map((category) => (
              <Tabs.Content
                key={category.id}
                value={category.id}
                className="py-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.videos.map((video) => (
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
              </Tabs.Content>
            ))}
          </Tabs.Root>
        </div>
      )}
    </div>
  );
};

export default ChannelVideos;
