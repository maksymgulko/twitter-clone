import { NotificationCollection } from "../models/notification.model.js";
import { UserCollection } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";

export const getUserProfileCOntroller = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await UserCollection.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("error in getUserProfileCOntroller", error);
    res.status(500).json({ error: error });
  }
};

export const followOrUnUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await UserCollection.findById(req.user._id);
    const modifiedUser = await UserCollection.findById(id);
    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "You can't follow yourself" });
    }
    if (!modifiedUser || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      //follow
      await UserCollection.findByIdAndUpdate(id, {
        $pull: { followers: req.user._id },
      });
      await UserCollection.findByIdAndUpdate(req.user._id, {
        $pull: { following: id },
      });
      res.status(200).json({ message: "Unfollowed successfully" });
    } else {
      //unfollow
      await UserCollection.findByIdAndUpdate(id, {
        $push: { followers: req.user._id },
      });
      await UserCollection.findByIdAndUpdate(req.user._id, {
        $push: { following: id },
      });

      const newNotification = new NotificationCollection({
        senderId: req.user._id,
        receiverId: modifiedUser._id,
        type: "follow",
      });

      await newNotification.save();

      res.status(200).json({ message: "Followed successfully" });
    }
  } catch (error) {
    console.error("error in followOrUnUserController", error);
    res.status(500).json({ error });
  }
};

export const getRecommendedUsersController = async (req, res) => {
  try {
    const userId = req.user._id;

    const followedByMe = await UserCollection.findById(userId).select(
      "following"
    );

    const users = await UserCollection.aggregate([
      {
        $match: { _id: { $ne: userId } },
      },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !followedByMe.following.includes(user._id)
    );

    const recommendedUsers = filteredUsers.slice(0, 4);

    recommendedUsers.forEach((user) => (user.password = null));

    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("error in getRecommendedUsersController", error);
    res.status(500).json({ error });
  }
};

export const updateUserController = async (req, res) => {
  const { fullname, username, email, currentPwd, newPwd, bio, link } = req.body;
  let { profilePicture, coverPicture } = req.body;
  const userId = req.user._id;

  try {
    let user = await UserCollection.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if ((!currentPwd && newPwd) || (!newPwd && currentPwd)) {
      return res
        .status(404)
        .json({ error: "Please enter both current and new password" });
    }

    if (currentPwd && newPwd) {
      const isSame = await bcrypt.compare(currentPwd, user.password);
      if (!isSame) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      if (newPwd.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPwd, salt);
    }

    if (profilePicture) {
      if (user.profilePicture) {
        await cloudinary.uploader.destroy(
          user.profilePicture.split("/").pop().split(".")[0]
        );
      }
      const response = await cloudinary.uploader.upload(profilePicture);
      profilePicture = response.secure_url;
    }
    if (coverPicture) {
      if (user.coverPicture) {
        await cloudinary.uploader.destroy(
          user.coverPicture.split("/").pop().split(".")[0]
        );
      }
      const response = await cloudinary.uploader.upload(coverPicture);
      profilePicture = response.secure_url;
    }

    user.fullname = fullname || user.fullname;
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profilePicture = profilePicture || user.profilePicture;
    user.coverPicture = coverPicture || user.coverPicture;

    user = await user.save();

    user.password = null;

    return res
      .status(200)
      .json({ message: "User updated successfully", data: user });
  } catch (error) {
    console.error("error in updateUserController", error);
    res.status(500).json({ error });
  }
};
