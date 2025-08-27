import express from "express";
import { protect } from "../middleware/authMiddleware";
import { login, register } from "../controllers/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });
  res.status(200).json({ success: true });
});

router.get("/me", protect, (req, res) => {
  res.status(200).json({ user: req.user });
});
export default router;
