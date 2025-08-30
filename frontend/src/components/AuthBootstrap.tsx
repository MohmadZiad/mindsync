"use client";
import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { meThunk } from "@/redux/slices/authSlice";

export default function AuthBootstrap() {
  const dispatch = useAppDispatch();
  useEffect(() => { dispatch(meThunk()); }, [dispatch]);
  return null;
}
