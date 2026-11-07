"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CaretRight, MapPin, Plus } from "@phosphor-icons/react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { dayNames, daysOfWeek } from "@/lib/venueForm";
import { getVenue, type VenueDetail as Venue } from "@/lib/venues";

type LoadState =
  | { status: "loading" }
  | { status: "notFound" }
  | { status: "error"; message: string }
  | { status: "done"; venue: Venue };

const cardClass = "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-100 sm:p-8";
const sectionTitleClass = "font-display text-xl font-semibold text-brand-900";

export function VenueDetail({ id }: { id: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

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
              : "Sportoviště se nepodařilo načíst. Zkuste to prosím znovu.",
        });
      });
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-12 md:py-16">
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

      {state.status === "loading" && <p className="mt-8 text-muted">Načítání…</p>}

      {state.status === "notFound" && (
        <div className="mt-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Sportoviště nenalezeno
          </h1>
          <p className="mt-3 text-muted">
            Odkaz je neplatný nebo sportoviště už neexistuje.
          </p>
        </div>
      )}

      {state.status === "error" && (
        <p role="alert" className="mt-8 font-medium text-red-700 dark:text-red-400">
          {state.message}
        </p>
      )}

      {state.status === "done" && <VenueContent venue={state.venue} />}
    </main>
  );
}

function VenueContent({ venue }: { venue: Venue }) {
  const { user } = useAuth();
  const isManager = Boolean(user?.roles.includes("MANAGER"));
  const hoursByDay = new Map(venue.openingHours.map((hours) => [hours.dayOfWeek, hours]));

  return (
    <>
      <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        {venue.name}
      </h1>
      <p className="mt-3 flex items-center gap-2 text-lg text-muted">
        <MapPin size={20} aria-hidden="true" />
        {venue.address}, {venue.city}
      </p>
      {venue.description && (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-900">
          {venue.description}
        </p>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <section className={cardClass} aria-labelledby="hours-title">
          <h2 id="hours-title" className={sectionTitleClass}>
            Otevírací doba
          </h2>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
            {daysOfWeek.map((day) => {
              const hours = hoursByDay.get(day);
              return (
                <div key={day} className="contents">
                  <dt className="font-medium text-ink-900">{dayNames[day]}</dt>
                  <dd className="text-right tabular-nums text-ink-500">
                    {hours ? `${hours.openTime}–${hours.closeTime}` : "Zavřeno"}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>

        <section className={cardClass} aria-labelledby="courts-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="courts-title" className={sectionTitleClass}>
              Kurty a hřiště
            </h2>
            {isManager && (
              <Link
                href={`/venues/${venue.id}/courts/new`}
                className="button button-outline min-h-10 px-4 py-2"
              >
                <Plus size={16} aria-hidden="true" /> Přidat kurt
              </Link>
            )}
          </div>
          {venue.courts.length === 0 ? (
            <p className="mt-4 text-muted">Sportoviště zatím nemá žádné kurty.</p>
          ) : (
            <ul className="mt-4 divide-y divide-brand-100">
              {venue.courts.map((court) => (
                <li key={court.id} className="py-4 first:pt-0 last:pb-0">
                  <p className="font-semibold text-brand-900">{court.name}</p>
                  <p className="mt-1 text-sm text-ink-500">
                    {court.sport} · {court.surface} ·{" "}
                    {court.indoor ? "vnitřní" : "venkovní"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
