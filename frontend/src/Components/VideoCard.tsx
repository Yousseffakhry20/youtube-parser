import React from "react";
import type { Video } from "../Types/Types";

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  return (
    <div className="border border-gray-200 rounded-md p-4">
      <h4 className="font-medium">{video.title}</h4>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
        {video.description}
      </p>
      <div className="text-xs text-gray-500 mt-2">
        Channel: {video.channelTitle}
      </div>
      <div className="text-xs text-gray-500">
        Published: {new Date(video.publishedAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default VideoCard;
