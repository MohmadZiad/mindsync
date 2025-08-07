import express from "express";
import { protect } from "../middleware/authMiddleware";
import { login, register } from "../controllers/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "logged out Succsesfully" });
});

router.get("/me", protect, (req, res) => {
  res.status(200).json({ user: req.user });
});
export default router;
