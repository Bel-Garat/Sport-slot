"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  MagnifyingGlass,
  MapPin,
  Plus,
  TennisBall,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { capitalize, imageForSports, popularSports } from "@/lib/venueVisuals";
import { listVenues, venuePageSize, type VenueList, type VenueListItem } from "@/lib/venues";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; list: VenueList };

const fieldClass =
  "h-12 w-full rounded-xl border border-line bg-page pr-3 pl-11 text-foreground placeholder:text-muted/70 transition focus:border-brand-500 focus:ring-3 focus:ring-brand-500/20 focus:outline-none";

function pageIndexFrom(value: string | null): number {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}

function venuesLabel(count: number): string {
  if (count === 1) return "1 sportoviště";
  if (count >= 2 && count <= 4) return `${count} sportoviště`;
  return `${count} sportovišť`;
}

export function VenueSearchSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="relative -mt-8 h-[132px] animate-pulse rounded-2xl border border-line bg-surface md:h-[118px]" />
      <div className="mt-10 h-5 w-40 animate-pulse rounded bg-surface" />
      <ResultSkeleton />
    </div>
  );
}

export function VenueSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const city = searchParams.get("city") ?? "";
  const sport = searchParams.get("sport") ?? "";
  const pageIndex = pageIndexFrom(searchParams.get("page"));

  const [cityInput, setCityInput] = useState(city);
  const [sportInput, setSportInput] = useState(sport);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setCityInput(city);
    setSportInput(sport);
  }, [city, sport]);

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });
    listVenues({ city, sport, pageIndex })
      .then((list) => {
        if (active) setState({ status: "done", list });
      })
      .catch((error: unknown) => {
        if (!active) return;
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
  }, [city, sport, pageIndex, attempt]);

  function hrefFor(next: { city: string; sport: string; pageIndex: number }) {
    const query = new URLSearchParams();
    if (next.city.trim()) query.set("city", next.city.trim());
    if (next.sport.trim()) query.set("sport", next.sport.trim());
    if (next.pageIndex > 0) query.set("page", String(next.pageIndex));
    const search = query.toString();
    return search ? `${pathname}?${search}` : pathname;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(hrefFor({ city: cityInput, sport: sportInput, pageIndex: 0 }));
  }

  function toggleSport(value: string) {
    const nextSport = sport.toLocaleLowerCase("cs") === value ? "" : value;
    router.push(hrefFor({ city, sport: nextSport, pageIndex: 0 }));
  }

  const filtered = Boolean(city || sport);
  const isManager = Boolean(user?.roles.includes("MANAGER"));

  return (
    <>
      <form
        role="search"
        onSubmit={handleSubmit}
        className="relative -mt-8 rounded-2xl border border-line bg-page p-4 shadow-[0_18px_50px_-30px_rgba(23,59,43,.45)] md:p-5"
      >
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <label className="relative block">
            <span className="sr-only">Město</span>
            <MapPin size={20} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
            <input
              className={fieldClass}
              value={cityInput}
              placeholder="Město, např. Praha"
              autoComplete="address-level2"
              onChange={(event) => setCityInput(event.target.value)}
            />
          </label>
          <label className="relative block">
            <span className="sr-only">Sport</span>
            <TennisBall size={20} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
            <input
              className={fieldClass}
              value={sportInput}
              placeholder="Sport, např. tenis"
              onChange={(event) => setSportInput(event.target.value)}
            />
          </label>
          <button type="submit" className="button button-primary h-12 min-h-12 gap-2.5">
            <MagnifyingGlass size={18} aria-hidden="true" /> Hledat
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold tracking-[.08em] text-muted uppercase">Oblíbené</span>
          {popularSports.map((value) => {
            const active = sport.toLocaleLowerCase("cs") === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => toggleSport(value)}
                className={`min-h-9 rounded-full border px-3.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-foreground bg-foreground text-page"
                    : "border-line text-foreground hover:bg-surface"
                }`}
              >
                {capitalize(value)}
              </button>
            );
          })}
        </div>
      </form>

      <section aria-live="polite" aria-busy={state.status === "loading"} className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-muted">
            {state.status === "done"
              ? venuesLabel(state.list.pageInfo.total)
              : state.status === "loading"
                ? "Hledáme…"
                : "Výsledky"}
            {filtered && (
              <span className="font-normal">
                {" "}
                · {[city && `město „${city}“`, sport && `sport „${sport}“`].filter(Boolean).join(", ")}
              </span>
            )}
          </h2>
          {filtered && (
            <Link
              href={pathname}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line px-3 text-sm font-medium text-foreground hover:bg-surface"
            >
              <X size={14} aria-hidden="true" /> Zrušit filtry
            </Link>
          )}
        </div>

        {state.status === "loading" && <ResultSkeleton />}

        {state.status === "error" && (
          <div role="alert" className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface/60 p-6 sm:flex-row sm:items-center">
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

        {state.status === "done" && state.list.itemList.length === 0 && (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-surface text-muted">
              <MagnifyingGlass size={26} aria-hidden="true" />
            </span>
            <p className="mt-5 font-display text-xl font-semibold text-foreground">
              {filtered ? "Nic jsme nenašli" : "Zatím tu není žádné sportoviště"}
            </p>
            <p className="mt-2 max-w-md text-muted">
              {filtered
                ? "Zkuste jiné město nebo sport, případně zrušte filtry a projděte všechna sportoviště."
                : "Jakmile správci přidají svá sportoviště a kurty, objeví se tady."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {filtered && (
                <Link href={pathname} className="button button-outline">
                  Zrušit filtry
                </Link>
              )}
              {isManager && (
                <Link href="/venues/new" className="button button-dark">
                  Přidat sportoviště <Plus size={18} aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        )}

        {state.status === "done" && state.list.itemList.length > 0 && (
          <>
            <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {state.list.itemList.map((venue, index) => (
                <li key={venue.id}>
                  <VenueCard venue={venue} priority={index < 3} highlightedSport={sport} />
                </li>
              ))}
            </ul>
            <Pagination
              pageIndex={pageIndex}
              total={state.list.pageInfo.total}
              hrefFor={(nextPage) => hrefFor({ city, sport, pageIndex: nextPage })}
            />
          </>
        )}
      </section>
    </>
  );
}

function ResultSkeleton() {
  return (
    <div aria-hidden="true" className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-line">
          <div className="aspect-[16/10] animate-pulse bg-surface" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 animate-pulse rounded bg-surface" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-surface" />
            <div className="flex gap-2">
              <div className="h-6 w-16 animate-pulse rounded-full bg-surface" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-surface" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function VenueCard({
  venue,
  priority,
  highlightedSport,
}: {
  venue: VenueListItem;
  priority: boolean;
  highlightedSport: string;
}) {
  const shown = venue.sports.slice(0, 3);
  const hidden = venue.sports.length - shown.length;
  const highlight = highlightedSport.toLocaleLowerCase("cs");

  return (
    <Link
      href={`/venues/${venue.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-page transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(23,59,43,.55)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface">
        <Image
          src={imageForSports(venue.sports)}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-page/90 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur">
          <MapPin size={13} aria-hidden="true" /> {venue.city}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl leading-snug font-semibold tracking-[-.02em] text-foreground">
          {venue.name}
        </h3>
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Sporty">
          {shown.map((value) => (
            <li
              key={value}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                highlight && value.toLocaleLowerCase("cs").includes(highlight)
                  ? "bg-ball text-brand-900"
                  : "bg-surface text-foreground"
              }`}
            >
              {capitalize(value)}
            </li>
          ))}
          {hidden > 0 && (
            <li className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-muted">+{hidden}</li>
          )}
        </ul>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-foreground">
          Zobrazit sportoviště
          <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function Pagination({
  pageIndex,
  total,
  hrefFor,
}: {
  pageIndex: number;
  total: number;
  hrefFor: (pageIndex: number) => string;
}) {
  const pageCount = Math.ceil(total / venuePageSize);
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Stránkování" className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
      {pageIndex > 0 ? (
        <Link href={hrefFor(pageIndex - 1)} className="button button-outline gap-2">
          <ArrowLeft size={16} aria-hidden="true" /> Předchozí
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-muted">
        Strana <strong className="text-foreground">{pageIndex + 1}</strong> z {pageCount}
      </span>
      {pageIndex + 1 < pageCount ? (
        <Link href={hrefFor(pageIndex + 1)} className="button button-outline gap-2">
          Další <ArrowRight size={16} aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
