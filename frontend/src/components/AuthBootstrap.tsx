"use client";
import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { meThunk } from "@/redux/slices/authSlice";

export default function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const once = useRef(false);

  useEffect(() => {
    if (once.current) return;
    once.current = true;
    dispatch(meThunk());
  }, [dispatch]);

  return null;
}
