"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, ArrowRight, Check, X, TennisBall, CalendarBlank } from "@phosphor-icons/react";

const sports = [
  { name: "Tenis", description: "Ještě jeden set?", image: "/images/tennis-hero.webp", alt: "Tenistka při úderu na zeleném venkovním kurtu", position: "76% center" },
  { name: "Padel", description: "Ve čtyřech je to lepší.", image: "/images/padel.webp", alt: "Hráči padelu na venkovním kurtu se skleněnou stěnou", position: "center" },
  { name: "Badminton", description: "Vypni hlavu. Zapni hru.", image: "/images/badminton.webp", alt: "Badmintonová raketa a péřový míček na zeleném kurtu", position: "center" },
];
const days = ["Pondělí", "Úterý", "Středa"];
const times = ["16:00", "17:00", "18:00", "19:00"];

export function SportExplorer() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [sport, setSport] = useState("Tenis");
  const [city, setCity] = useState("Praha");
  const [day, setDay] = useState("Úterý");
  const [time, setTime] = useState("17:00");
  const [complete, setComplete] = useState(false);

  function open(name: string) { setSport(name); setComplete(false); dialog.current?.showModal(); }
  function submit(event: FormEvent) { event.preventDefault(); setComplete(true); }

  return <>
    <div className="mt-10 grid gap-6 md:grid-cols-[1.25fr_1fr_1fr]">
      {sports.map((item) => <button key={item.name} type="button" onClick={() => open(item.name)} aria-haspopup="dialog" aria-label={`${item.name}: vyzkoušet ukázku rezervace`} className="group min-w-0 rounded-2xl text-left">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-brand-900 md:aspect-[4/5]">
          <Image src={item.image} alt={item.alt} fill sizes="(max-width: 767px) 100vw, 38vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" style={{ objectPosition: item.position }} />
          <span className="absolute right-4 bottom-4 flex size-12 items-center justify-center rounded-full bg-page text-foreground transition-colors group-hover:bg-ball group-hover:text-brand-900"><ArrowUpRight size={23} aria-hidden="true" /></span>
        </div>
        <div className="mt-5 flex items-start justify-between gap-3"><h3 className="font-display text-[26px] font-semibold tracking-tight">{item.name}</h3><span className="pt-2 text-xs text-muted">Ukázka rezervace</span></div>
        <p className="mt-1 text-sm text-muted">{item.description}</p>
      </button>)}
    </div>
    <dialog ref={dialog} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-line bg-page p-6 text-foreground shadow-2xl backdrop:bg-black/60 sm:p-8" aria-labelledby="booking-title" aria-describedby="booking-description" onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold text-muted">Interaktivní ukázka</p><h2 id="booking-title" className="mt-2 font-display text-3xl font-semibold tracking-tight">{complete ? "Ukázka dokončena" : "Udělej si čas na hru."}</h2></div><button type="button" onClick={() => dialog.current?.close()} aria-label="Zavřít ukázku" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line"><X size={20} aria-hidden="true" /></button></div>
      <p id="booking-description" className="mt-4 text-sm leading-relaxed text-muted">Vyzkoušej si výběr sportu a času. Jde o ukázková data, skutečná rezervace nevznikne.</p>
      {complete ? <div role="status" className="mt-6">
        <div className="rounded-xl border border-line bg-surface p-6"><span className="flex size-12 items-center justify-center rounded-full bg-ball text-brand-900"><Check size={26} aria-hidden="true" /></span><h3 className="mt-5 font-display text-2xl font-semibold">{sport} v tvém kalendáři</h3><p className="mt-3 flex items-center gap-2 text-sm"><CalendarBlank size={18} aria-hidden="true" />{day}, {time} na 60 minut</p><p className="mt-2 text-sm text-muted">{city} · Ukázkový kurt</p></div>
        <p className="mt-5 text-sm leading-relaxed text-muted">Takto bude výběr termínu fungovat. Ostré rezervace připravujeme.</p><button type="button" className="button button-dark mt-6 w-full" onClick={() => setComplete(false)}>Vyzkoušet jiný termín <ArrowRight size={18} aria-hidden="true" /></button>
      </div> : <form onSubmit={submit} className="mt-6 grid gap-6">
        <div className="grid grid-cols-2 gap-4"><label className="grid gap-2 text-sm font-semibold">Sport<select className="min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-base font-normal text-foreground" value={sport} onChange={(e) => setSport(e.target.value)}>{["Tenis", "Padel", "Badminton", "Squash", "Volejbal"].map(name => <option key={name}>{name}</option>)}</select></label><label className="grid gap-2 text-sm font-semibold">Město<select className="min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-base font-normal text-foreground" value={city} onChange={(e) => setCity(e.target.value)}>{["Praha", "Brno", "Ostrava"].map(name => <option key={name}>{name}</option>)}</select></label></div>
        <fieldset><legend className="mb-3 text-sm font-semibold">Den</legend><div className="grid grid-cols-3 gap-2">{days.map(value => <label key={value} className="cursor-pointer"><input type="radio" className="peer sr-only" name="demo-day" value={value} checked={day === value} onChange={() => setDay(value)} /><span className="flex min-h-12 items-center justify-center rounded-xl border border-line text-sm peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-page peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600">{value}</span></label>)}</div></fieldset>
        <fieldset><legend className="mb-3 text-sm font-semibold">Začátek hry <span className="font-normal text-muted">(60 minut)</span></legend><div className="grid grid-cols-4 gap-2">{times.map(value => <label key={value} className="cursor-pointer"><input type="radio" className="peer sr-only" name="demo-time" value={value} checked={time === value} onChange={() => setTime(value)} /><span className="flex min-h-12 items-center justify-center rounded-xl border border-line text-sm tabular-nums peer-checked:border-brand-900 peer-checked:bg-ball peer-checked:text-brand-900 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600">{value}</span></label>)}</div></fieldset>
        <button type="submit" className="button button-dark w-full"><TennisBall size={19} aria-hidden="true" />Dokončit ukázku <ArrowRight size={18} aria-hidden="true" /></button>
      </form>}
    </dialog>
  </>;
}
