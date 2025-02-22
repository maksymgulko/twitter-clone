import { NotificationCollection } from "../models/notification.model.js";
import { PostCollection } from "../models/post.model.js";
import { UserCollection } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPostController = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await UserCollection.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!text && !img) {
      return res.status(400).json({ error: "Post can't be empty" });
    }

    if (img) {
      const response = await cloudinary.uploader.upload(img);
      img = response.secure_url;
    }

    const post = new PostCollection({
      text,
      img,
      user: userId,
    });

    await post.save();
    return res.status(201).json({ post });
  } catch (error) {
    console.error("error in the createPostController ", error);
    return res.status(500).json({ error: error.message });
  }
};

export const deletePostController = async (req, res) => {
  try {
    const post = await PostCollection.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (post.img) {
      const img = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(img);
    }
    await PostCollection.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.error("error in the deletePostController ", error);
    return res.status(500).json({ error: error.message });
  }
};

export const likePostController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await PostCollection.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      //unlike post
      await PostCollection.updateOne(
        { _id: postId },
        { $pull: { likes: userId } }
      );

      await UserCollection.updateOne(
        { _id: userId },
        { $pull: { likedPosts: postId } }
      );

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );

      return res.status(200).json(updatedLikes);
    } else {
      //like post
      post.likes.push(userId);
      await UserCollection.updateOne(
        { _id: userId },
        { $push: { likedPosts: postId } }
      );
      await post.save();
    }

    const notification = new NotificationCollection({
      senderId: userId,
      receiverId: post.user,
      type: "like",
    });
    await notification.save();
    const updatedLikes = post.likes;
    return res.status(200).json(updatedLikes);
  } catch (error) {
    console.error("error in the likePostController ", error);
    return res.status(500).json({ error: error.message });
  }
};

export const commentPostController = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;
    const postId = req.params.id;

    if (!text) {
      return res.status(400).json({ error: "Comment can't be empty" });
    }

    const post = await PostCollection.findById(postId);

    if (!post) {
      return res.status(400).json({ error: "Post not found" });
    }

    const comment = { user: userId, text };
    post.comments.push(comment);

    await post.save();
    return res.status(200).json({ post });
  } catch (error) {
    console.error("error in the commentPostController ", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getPostsController = async (req, res) => {
  try {
    const posts = await PostCollection.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (!posts) {
      return res.status(200).json([]);
    }
    return res.status(200).json(posts);
  } catch (error) {
    console.error("error in the getPostsController ", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getLikedPostsController = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserCollection.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const likedPosts = await PostCollection.find({
      _id: { $in: user.likedPosts },
    })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    return res.status(200).json(likedPosts);
  } catch (error) {
    console.error("error in the getLikedPostsController ", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getFollowingPostsController = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserCollection.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const following = user.following;
    const posts = await PostCollection.find({ user: { $in: following } })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    return res.status(200).json(posts);
  } catch (error) {
    console.error("error in the getFollowingPostsController ", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getUsersPostsController = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await UserCollection.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const posts = await PostCollection.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    return res.status(200).json(posts);
  } catch (error) {
    console.error("error in the getUsersPostsController ", error);
    return res.status(500).json({ error: error.message });
  }
};
