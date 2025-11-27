import express from "express";
import dotenv from "dotenv";
import cors from "cors";
const app = express();
app.use(cors({
    origin: "*",
}));
app.get("/", (req, res) => {
    res.json("Hello");
});
app.listen(4000, () => {
    console.log("Server has started on PORT 4000");
});
