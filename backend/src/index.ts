import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import channelRoutes from "./routes/channelRoutes.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/youtube_parser")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware to parse JSON bodies
app.use(express.json());

// Existing route
app.get("/", (req, res) => {
  res.json("Hello");
});

// Add channel routes
app.use("/api", channelRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server has started on PORT ${PORT}`);
});
