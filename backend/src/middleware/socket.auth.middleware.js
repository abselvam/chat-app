import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("jwt="))
      ?.split("=")[1];
    if (!token) {
      console.log("Socket connection rejected. No token");
      return next(new Error("Unauthorized- No token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded)
      return res.status(401).json({ message: "Unauthorized - Invalid token" });

    // const some = decoded.email
    // console.log(some)

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    socket.user = user;
    socket.userId = user._id.toString();
    console.log(`socket authenticated for user: ${user.fullName}(${user._id})`);

    next();
  } catch (error) {
    console.log("Error in socketAuthMiddleware middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
