import express from "express";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`runnung on PORT: ${PORT}`);
});
