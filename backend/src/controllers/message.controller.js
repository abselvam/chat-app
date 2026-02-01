import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const getAllContacts = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const fliteredUsers = await User.find({
      _id: { $ne: currentUserId },
    }).select("-password");
    res.status(200).json(fliteredUsers);
  } catch (error) {
    console.log("Error at getAllContacts controller", error);
    res.status(500).json({ Message: "Internal error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: theirId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, recieverId: theirId },
        { senderId: theirId, recieverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error at getMessagesByUserId controller", error);
    res.status(500).json({ Message: "Internal error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const myId = req.user._id;
    const { text, image } = req.body;

    if (!image || !text) {
      return res.status(400).json({ message: "text or image is required" });
    }
    if (myId.equals(id)) {
      return res.status(400).json({ message: "Cannot message yourself" });
    }
    receiverExists = await User.exists({ _id: id });
    if (!receiverExists) {
      return res
        .status(404)
        .json({ message: "user you are trying to message doesnt exist" });
    }

    let imageUrl;
    if (image) {
      const response = await cloudinary.uploader.upload(image);
      imageUrl = response.secure_url;
    }

    const newMessage = new Message({
      recieverId: id,
      senderId: myId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error at sendMessage controller", error);
    res.status(500).json({ Message: "Internal error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [{ senderId: myId }, { recieverId: myId }],
    });
    const chatPartnerIds = [
      ...new Set(
        messages.map((chat) =>
          chat.senderId.toString() === myId.toString()
            ? chat.recieverId.toString()
            : chat.senderId.toString(),
        ),
      ),
    ];

    const chatPartners = await User.find({
      _id: { $in: chatPartnerIds },
    }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.log("Error at getChatPartners controller", error);
    res.status(500).json({ Message: "Internal error" });
  }
};
