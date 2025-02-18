import express from "express";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
import mongoConnect from "./db/mongoConnect.js";
import cookieParser from "cookie-parser";

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`runnung on PORT: ${PORT}`);
  mongoConnect();
});
