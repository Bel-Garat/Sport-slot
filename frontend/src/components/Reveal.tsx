"use client";

import { useEffect, useRef, type ReactNode } from "react";

const enterFrames: Keyframe[] = [
  { opacity: 0, transform: "translateY(24px)" },
  { opacity: 1, transform: "translateY(0)" },
];

export function Reveal({
  children,
  className = "",
  delay = 0,
  stagger,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (
      !node ||
      !window.IntersectionObserver ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const targets: Element[] = stagger
      ? Array.from(node.querySelectorAll(stagger))
      : [node];
    let animations: Animation[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        animations = targets.map((target, index) =>
          target.animate(enterFrames, {
            duration: 650,
            delay: delay + index * 90,
            easing: "cubic-bezier(.16,1,.3,1)",
            fill: "backwards",
          }),
        );
        observer.disconnect();
      },
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, [delay, stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
