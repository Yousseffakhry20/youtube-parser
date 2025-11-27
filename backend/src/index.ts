import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import channelRoutes from "./routes/channelRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

// Middleware to parse JSON bodies
app.use(express.json());

// Existing route
app.get("/", (req, res) => {
  res.json("Hello");
});

// Add channel routes
app.use(channelRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server has started on PORT ${PORT}`);
});
