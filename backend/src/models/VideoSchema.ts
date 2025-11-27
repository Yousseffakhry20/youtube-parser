import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  description: { type: String },
  publishedAt: { type: String, required: true },
  channelId: { type: String, required: true },
  channelTitle: { type: String, required: true },
  categoryId: { type: String },
  tags: { type: [String] },
  createdAt: { type: Date, default: Date.now },
});

export interface IVideo extends mongoose.Document {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  categoryId?: string;
  tags?: string[];
  createdAt: Date;
}

const Video = mongoose.model<IVideo>("Video", VideoSchema);
export default Video;
