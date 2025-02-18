import express, { Router } from "express";
import {
  loginController,
  logoutController,
  signupController,
} from "../controllers/auth.controller.js";

const router = Router();

router.get("/signup", signupController);

router.get("/login", loginController);

router.get("/logout", logoutController);

export default router;
