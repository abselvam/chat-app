import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import path from "path";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import cors from "cors";

dotenv.config();

const __dirname = path.resolve();

const app = express();

app.use(express.json({ limit: "5mb" }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());

const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

//for deployement
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
  connectDB();
});
