"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react";

export function HeroMedia() {
  const video = useRef<HTMLVideoElement>(null);
  const playRequested = useRef(true);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let inView = true;

    const load = () => {
      if (!element.getAttribute("src")) element.src = "/media/court-loop.mp4";
    };
    const sync = () => {
      if (playRequested.current && inView && !document.hidden) {
        load();
        void element.play().catch(() => setPlaying(false));
      } else element.pause();
    };
    const onPreference = () => {
      playRequested.current = !preference.matches && !connection?.saveData;
      sync();
    };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }, { threshold: 0.05 });
    onPreference();
    observer?.observe(element);
    preference.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", sync);
    return () => { observer?.disconnect(); preference.removeEventListener("change", onPreference); document.removeEventListener("visibilitychange", sync); element.pause(); };
  }, []);

  function toggle() {
    const element = video.current;
    if (!element) return;
    playRequested.current = !playing;
    if (playing) element.pause();
    else {
      if (!element.getAttribute("src")) element.src = "/media/court-loop.mp4";
      void element.play().catch(() => setPlaying(false));
    }
  }

  return <>
    <Image src="/images/tennis-hero.webp" alt="Tenistka na zeleném kurtu v odpoledním slunci" fill priority sizes="100vw" className="hero-photo -z-20 object-cover object-[84%_center] md:object-center" />
    <video ref={video} muted loop playsInline preload="none" aria-hidden="true" onPlaying={() => { setPlaying(true); setReady(true); }} onPause={() => setPlaying(false)} onError={() => { setReady(false); setPlaying(false); }} className={`pointer-events-none absolute inset-0 -z-20 size-full object-cover object-[84%_center] transition-opacity duration-700 md:object-center ${ready ? "opacity-100" : "opacity-0"}`} />
    <div className="absolute right-6 bottom-6 sm:right-10 sm:bottom-8 md:right-12">
      <button type="button" onClick={toggle} aria-label={playing ? "Pozastavit video na pozadí" : "Přehrát video na pozadí"} aria-pressed={playing} className="group flex min-h-12 items-center gap-3 rounded-full border border-white/45 bg-[#173b2b]/60 px-4 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-[#173b2b]/90 focus-visible:outline-white">
        {playing ? <Pause size={16} weight="fill" aria-hidden="true" /> : <Play size={16} weight="fill" aria-hidden="true" />}<span>{playing ? "Pozastavit" : "Přehrát pozadí"}</span>
      </button>
    </div>
  </>;
}
