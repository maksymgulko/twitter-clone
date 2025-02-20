import { Router } from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import {
  deleteNotificationController,
  deleteSingleNotificationController,
  getNotificationsController,
} from "../controllers/notification.controller.js";

const router = Router();

router.get("/", protectRoute, getNotificationsController);

router.delete("/", protectRoute, deleteNotificationController);

router.delete("/:id", protectRoute, deleteSingleNotificationController);

export default router;
