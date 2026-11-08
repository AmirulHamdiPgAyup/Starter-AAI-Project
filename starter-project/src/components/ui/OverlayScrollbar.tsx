"use client";

import { useEffect, useRef, useState } from "react";

// How far down the page's top bar reaches. The thumb stays below it.
// The top bar is marked with `data-app-header`;
// the login page has none.
function headerBottom(): number {
  let bottom = 0;
  document.querySelectorAll("[data-app-header]").forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.height > 0) bottom = Math.max(bottom, rect.bottom);
  });
  return bottom;
}

// A page scrollbar that floats over the content instead of taking up space.
// The browser's own page scrollbar is hidden in globals.css; this draws a slim
// thumb on the right edge, below the top bar, that appears while you scroll
// (or hover it) and can be dragged. Mouse wheel, trackpad and keyboard
// scrolling work as normal.
export function OverlayScrollbar() {
  // `track` is the space the thumb can move in: from below the top bar to the
  // bottom of the window.
  const [thumb, setThumb] = useState({ top: 0, height: 0, track: 0 });
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drag = useRef({ startY: 0, startScroll: 0 });

  useEffect(() => {
    // Work out the thumb's size and position from the page's scroll position.
    function update() {
      const view = window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (total <= view + 1) {
        setThumb({ top: 0, height: 0, track: 0 });
        return;
      }
      const start = headerBottom();
      const track = view - start;
      const height = Math.max((view / total) * track, 40);
      const top = start + (window.scrollY / (total - view)) * (track - height);
      setThumb({ top, height, track });
    }

    function onScroll() {
      update();
      setVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(false), 900);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    // The page height changes when content loads or a section opens.
    const observer = new ResizeObserver(update);
    observer.observe(document.body);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      observer.disconnect();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  // Dragging the thumb scrolls the page.
  useEffect(() => {
    if (!dragging) return;

    function onMove(event: PointerEvent) {
      const view = window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const ratio = (total - view) / (thumb.track - thumb.height);
      window.scrollTo({ top: drag.current.startScroll + (event.clientY - drag.current.startY) * ratio });
    }
    function onUp() {
      setDragging(false);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, thumb.height, thumb.track]);

  if (thumb.height === 0) return null;

  return (
    <div
      aria-hidden="true"
      onPointerDown={(event) => {
        event.preventDefault();
        drag.current = { startY: event.clientY, startScroll: window.scrollY };
        setDragging(true);
      }}
      style={{ top: thumb.top, height: thumb.height }}
      className={`group fixed right-0 z-50 w-3 cursor-default px-[3px] transition-opacity duration-300 hover:opacity-100 ${
        visible || dragging ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`ml-auto h-full rounded-full bg-slate-500/45 transition-all group-hover:w-2 group-hover:bg-slate-500/70 ${
          dragging ? "w-2 bg-slate-500/70" : "w-1.5"
        }`}
      />
    </div>
  );
}
