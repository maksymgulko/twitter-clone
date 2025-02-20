import { Router } from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import {
  commentPostController,
  createPostController,
  deletePostController,
  getFollowingPostsController,
  getLikedPostsController,
  getPostsController,
  getUsersPostsController,
  likePostController,
} from "../controllers/post.controller.js";

const router = Router();

router.get("/all", protectRoute, getPostsController);

router.get("/following", protectRoute, getFollowingPostsController);

router.get("/likes/:id", protectRoute, getLikedPostsController);

router.get("/user/:username", protectRoute, getUsersPostsController);

router.post("/create", protectRoute, createPostController);

router.delete("/:id", protectRoute, deletePostController);

router.post("/like/:id", protectRoute, likePostController);

router.post("/comment/:id", protectRoute, commentPostController);

export default router;
