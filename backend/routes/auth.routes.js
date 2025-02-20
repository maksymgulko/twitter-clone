import { Router } from "express";
import {
  getUserController,
  loginController,
  logoutController,
  signupController,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = Router();

router.get("/user", protectRoute, getUserController);

router.post("/signup", signupController);

router.post("/login", loginController);

router.post("/logout", logoutController);

export default router;
