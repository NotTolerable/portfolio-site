"use client";

import { useEffect } from "react";

export function ComicEntrance() {
  useEffect(() => {
    const root = document.documentElement;
    const finish = () => { root.dataset.comicSeen = "true"; window.clearTimeout(timer); controller.abort(); };
    const timer = window.setTimeout(finish, 1300);
    const controller = new AbortController();
    window.addEventListener("keydown", finish, { signal: controller.signal });
    window.addEventListener("wheel", finish, { passive: true, signal: controller.signal });
    window.addEventListener("touchmove", finish, { passive: true, signal: controller.signal });
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, []);
  return null;
}
