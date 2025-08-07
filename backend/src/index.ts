import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import "./types/types";
import authRoutes from "./routes/auth";
import habitRoutes from "./routes/habit";
import entry from "./routes/entry";
dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/entries", entry);
app.get("/", (_, res) => res.send("API Running"));
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
