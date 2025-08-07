import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
/* -------------Register------------------*/
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists " });

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, password: hashPassword },
    });
    return res
      .status(201)
      .json({ message: "User Registerd", userId: newUser.id });
  } catch (error) {
    // console.error("Register Error:", error); 
    return res.status(500).json({ message: "Server Error" });
  }
};
/* -------------login------------------*/
export const login = async (req: Request, res: Response) => {
  try {
    // console.log("BODY:", req.body);
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Logged in successfully" });
  } catch (err) {

    return res.status(500).json({ message: "Server error", err });
  }
};


