"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowClockwise,
  CaretRight,
  Clock,
  House,
  MapPin,
  Plus,
  Sun,
  WarningCircle,
} from "@phosphor-icons/react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { dayNames, daysOfWeek } from "@/lib/venueForm";
import { capitalize, imageForSports } from "@/lib/venueVisuals";
import { getVenue, type VenueDetail as Venue } from "@/lib/venues";

type LoadState =
  | { status: "loading" }
  | { status: "notFound" }
  | { status: "error"; message: string }
  | { status: "done"; venue: Venue };

const cardClass = "rounded-2xl border border-line bg-page p-6";

function todayDayOfWeek(): number {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}

function sportsOf(venue: Venue): string[] {
  return [
    ...new Set(
      venue.courts.flatMap((court) =>
        court.sport.split(",").map((sport) => sport.trim()).filter(Boolean),
      ),
    ),
  ];
}

export function VenueDetail({ id }: { id: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });
    getVenue(id)
      .then((venue) => {
        if (active) setState({ status: "done", venue });
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
          setState({ status: "notFound" });
          return;
        }
        setState({
          status: "error",
          message:
            error instanceof ApiError
              ? error.message
              : "Server teď neodpovídá. Pokud byl delší dobu nečinný, probouzí se – zkuste to za chvíli znovu.",
        });
      });
    return () => {
      active = false;
    };
  }, [id, attempt]);

  return (
    <main id="main-content" className="section-wrap pt-8 pb-20 md:pt-10">
      <nav aria-label="Drobečková navigace">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          <li>
            <Link href="/venues" className="font-medium hover:text-foreground hover:underline">
              Sportoviště
            </Link>
          </li>
          <li aria-hidden="true">
            <CaretRight size={12} />
          </li>
          <li aria-current="page" className="max-w-[60vw] truncate font-medium text-foreground">
            {state.status === "done" ? state.venue.name : "Detail"}
          </li>
        </ol>
      </nav>

      {state.status === "loading" && <DetailSkeleton />}

      {state.status === "notFound" && (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-surface text-muted">
            <MapPin size={26} aria-hidden="true" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold text-foreground">
            Sportoviště nenalezeno
          </h1>
          <p className="mt-2 max-w-md text-muted">
            Odkaz je neplatný nebo sportoviště už neexistuje.
          </p>
          <Link href="/venues" className="button button-dark mt-6">
            Prohlédnout sportoviště
          </Link>
        </div>
      )}

      {state.status === "error" && (
        <div role="alert" className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface/60 p-6 sm:flex-row sm:items-center">
          <WarningCircle size={28} aria-hidden="true" className="shrink-0 text-red-700 dark:text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-foreground">Sportoviště se nepodařilo načíst</p>
            <p className="mt-1 text-sm text-muted">{state.message}</p>
          </div>
          <button type="button" onClick={() => setAttempt(attempt + 1)} className="button button-outline">
            Zkusit znovu <ArrowClockwise size={18} aria-hidden="true" />
          </button>
        </div>
      )}

      {state.status === "done" && <VenueContent venue={state.venue} />}
    </main>
  );
}

function DetailSkeleton() {
  return (
    <div aria-hidden="true" className="mt-6">
      <div className="aspect-[16/9] animate-pulse rounded-3xl bg-surface md:aspect-[21/8]" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="h-64 animate-pulse rounded-2xl bg-surface" />
        <div className="h-64 animate-pulse rounded-2xl bg-surface" />
      </div>
    </div>
  );
}

function VenueContent({ venue }: { venue: Venue }) {
  const { user } = useAuth();
  const isManager = Boolean(user?.roles.includes("MANAGER"));
  const sports = sportsOf(venue);
  const today = todayDayOfWeek();
  const hoursByDay = new Map(venue.openingHours.map((hours) => [hours.dayOfWeek, hours]));
  const todayHours = hoursByDay.get(today as Venue["openingHours"][number]["dayOfWeek"]);

  return (
    <>
      <header className="relative mt-6 overflow-hidden rounded-3xl">
        <div className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/8]">
          <Image
            src={venue.imageUrl ?? imageForSports(sports)}
            alt=""
            fill
            priority
            sizes="(min-width: 1360px) 1280px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-900/35 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
          <div className="flex flex-wrap gap-1.5">
            {sports.map((sport) => (
              <span key={sport} className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                {capitalize(sport)}
              </span>
            ))}
          </div>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] font-semibold tracking-[-.04em]">
            {venue.name}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-white/85">
            <MapPin size={18} aria-hidden="true" />
            {venue.address}, {venue.city}
          </p>
        </div>
      </header>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="grid gap-6">
          {venue.description && (
            <section className={cardClass} aria-labelledby="about-title">
              <h2 id="about-title" className="font-display text-xl font-semibold text-foreground">
                O sportovišti
              </h2>
              <p className="mt-3 leading-relaxed text-foreground/90">{venue.description}</p>
            </section>
          )}

          <section className={cardClass} aria-labelledby="courts-title">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="courts-title" className="font-display text-xl font-semibold text-foreground">
                Kurty a hřiště
                <span className="ml-2 text-base font-normal text-muted">{venue.courts.length}</span>
              </h2>
              {isManager && (
                <Link href={`/venues/${venue.id}/courts/new`} className="button button-outline min-h-10 gap-2 px-4 py-2">
                  <Plus size={16} aria-hidden="true" /> Přidat kurt
                </Link>
              )}
            </div>
            {venue.courts.length === 0 ? (
              <p className="mt-4 text-muted">Sportoviště zatím nemá žádné kurty.</p>
            ) : (
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {venue.courts.map((court) => (
                  <li key={court.id} className="rounded-xl border border-line bg-surface/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-foreground">{court.name}</p>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-page px-2 py-0.5 text-xs font-medium text-muted">
                        {court.indoor ? <House size={13} aria-hidden="true" /> : <Sun size={13} aria-hidden="true" />}
                        {court.indoor ? "Vnitřní" : "Venkovní"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground/90">{capitalize(court.sport)}</p>
                    <p className="mt-0.5 text-sm text-muted">{court.surface}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className={`${cardClass} lg:sticky lg:top-28`} aria-labelledby="hours-title">
          <h2 id="hours-title" className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
            <Clock size={20} aria-hidden="true" /> Otevírací doba
          </h2>
          <p className="mt-2 text-sm">
            {todayHours ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-ball px-3 py-1 font-semibold text-brand-900">
                Dnes otevřeno {todayHours.openTime}–{todayHours.closeTime}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 font-semibold text-muted">
                Dnes zavřeno
              </span>
            )}
          </p>
          <dl className="mt-5 divide-y divide-line">
            {daysOfWeek.map((day) => {
              const hours = hoursByDay.get(day);
              const isToday = day === today;
              return (
                <div
                  key={day}
                  className={`flex items-center justify-between py-2.5 text-sm ${isToday ? "font-semibold text-foreground" : "text-foreground/85"}`}
                >
                  <dt>
                    {dayNames[day]}
                    {isToday && <span className="sr-only"> (dnes)</span>}
                  </dt>
                  <dd className={`tabular-nums ${hours ? "" : "text-muted"}`}>
                    {hours ? `${hours.openTime}–${hours.closeTime}` : "Zavřeno"}
                  </dd>
                </div>
              );
            })}
          </dl>
        </aside>
      </div>
    </>
  );
}
