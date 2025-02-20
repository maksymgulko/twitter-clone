import { Router } from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import {
  followOrUnUserController,
  getRecommendedUsersController,
  getUserProfileCOntroller,
  updateUserController,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/profile/:username", protectRoute, getUserProfileCOntroller);

router.get("/recommended", protectRoute, getRecommendedUsersController);

router.post("/follow/:id", protectRoute, followOrUnUserController);

router.post("/update", protectRoute, updateUserController);

export default router;
