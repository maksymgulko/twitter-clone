import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserCollection } from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";

export const signupController = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailregex.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const ifUserNameExists = await UserCollection.findOne({ username });
    if (ifUserNameExists) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const ifEmailExists = await UserCollection.findOne({ email });
    if (ifEmailExists) {
      return res
        .status(400)
        .json({ error: "This email is already registered" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const salt = await bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserCollection({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
        coverPicture: newUser.coverPicture,
        followers: newUser.followers,
        following: newUser.following,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.error("error in signup controller", error);

    res.status(500).json({ error: error.message });
  }
};

export const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserCollection.findOne({ username });

    const isPwdValid = await bcrypt.compare(password, user?.password || "");
    if (!isPwdValid || !user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      coverPicture: user.coverPicture,
      followers: user.followers,
      following: user.following,
    });
  } catch (error) {
    console.error("error in login controller", error);

    res.status(500).json({ error: error.message });
  }
};

export const logoutController = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("error in logout controller", error);

    res.status(500).json({ error: error.message });
  }
};

export const getUserController = async (req, res) => {
  try {
    const user = await UserCollection.findById(req.user._id).select(
      "-password"
    );
    res.status(200).json(user);
  } catch (error) {
    console.error("error in get user controller", error);

    res.status(500).json({ error: error.message });
  }
};
