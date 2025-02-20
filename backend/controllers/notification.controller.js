import { NotificationCollection } from "../models/notification.model.js";

export const getNotificationsController = async (req, res) => {
  try {
    const userId = req.user._id;
    const notification = await NotificationCollection.find({
      receiverId: userId,
    }).populate({
      path: "senderId",
      select: "username profilePic",
    });

    if (!notification) {
      return res.status(404).json({ message: "No notifications found" });
    }

    await NotificationCollection.updateMany(
      { receiverId: userId },
      { read: true }
    );

    res.status(200).json(notification);
  } catch (error) {
    console.error("error in getNotificationsController", error);

    res.status(500).json({ message: error.message });
  }
};

export const deleteNotificationController = async (req, res) => {
  try {
    const userId = req.user._id;
    await NotificationCollection.deleteMany({ receiverId: userId });
    res.status(200).json({ message: "All notifications deleted" });
  } catch (error) {
    console.error("error in deleteNotificationController", error);

    res.status(500).json({ message: error.message });
  }
};

export const deleteSingleNotificationController = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;
    const notification = await NotificationCollection.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await NotificationCollection.findByIdAndDelete(notificationId);
    res.status(500).json({ message: error.message });
  } catch (error) {
    console.error("error in deleteSingleNotificationController", error);

    res.status(500).json({ message: error.message });
  }
};
