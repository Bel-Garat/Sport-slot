"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ArrowUpRight, MagnifyingGlass } from "@phosphor-icons/react";
import { ApiError } from "@/lib/api";
import { listVenues, venuePageSize, type VenueList } from "@/lib/venues";

const inputClass =
  "w-full rounded-xl border border-brand-200 bg-white px-3.5 py-2.5 text-ink-900 shadow-xs transition placeholder:text-ink-500/60 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/20 focus:outline-none";
const labelClass = "text-sm font-semibold text-brand-900";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; list: VenueList };

function pageIndexFrom(value: string | null): number {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}

export function VenueSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const city = searchParams.get("city") ?? "";
  const sport = searchParams.get("sport") ?? "";
  const pageIndex = pageIndexFrom(searchParams.get("page"));

  const [cityInput, setCityInput] = useState(city);
  const [sportInput, setSportInput] = useState(sport);
  const [state, setState] = useState<LoadState>({ status: "loading" });

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
              : "Sportoviště se nepodařilo načíst. Zkuste to prosím znovu.",
        });
      });
    return () => {
      active = false;
    };
  }, [city, sport, pageIndex]);

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

  const filtered = Boolean(city || sport);

  return (
    <>
      <form
        role="search"
        onSubmit={handleSubmit}
        className="mt-8 grid gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-100 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6"
      >
        <label className="grid gap-1.5">
          <span className={labelClass}>Město</span>
          <input
            className={inputClass}
            value={cityInput}
            placeholder="Např. Praha"
            onChange={(event) => setCityInput(event.target.value)}
          />
        </label>
        <label className="grid gap-1.5">
          <span className={labelClass}>Sport</span>
          <input
            className={inputClass}
            value={sportInput}
            placeholder="Např. tenis"
            onChange={(event) => setSportInput(event.target.value)}
          />
        </label>
        <button type="submit" className="button button-dark">
          Hledat <MagnifyingGlass size={18} aria-hidden="true" />
        </button>
      </form>

      <section aria-live="polite" aria-busy={state.status === "loading"} className="mt-10">
        {state.status === "loading" && <p className="text-muted">Načítání…</p>}

        {state.status === "error" && (
          <p role="alert" className="font-medium text-red-700">
            {state.message}
          </p>
        )}

        {state.status === "done" && state.list.itemList.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line p-8 text-center">
            <p className="font-semibold text-foreground">
              {filtered
                ? "Žádné sportoviště neodpovídá hledání."
                : "Zatím tu není žádné sportoviště."}
            </p>
            {filtered && (
              <Link
                href={pathname}
                className="mt-3 inline-block font-semibold text-brand-700 underline underline-offset-4"
              >
                Zrušit filtry
              </Link>
            )}
          </div>
        )}

        {state.status === "done" && state.list.itemList.length > 0 && (
          <>
            <p className="text-sm text-muted">
              Nalezeno: {state.list.pageInfo.total}
            </p>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {state.list.itemList.map((venue) => (
                <li key={venue.id}>
                  <Link
                    href={`/venues/${venue.id}`}
                    className="group flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-100 transition hover:-translate-y-0.5 hover:ring-brand-500"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="font-display text-xl font-semibold text-brand-900">
                        {venue.name}
                      </span>
                      <ArrowUpRight
                        size={20}
                        aria-hidden="true"
                        className="shrink-0 text-brand-700 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                    <span className="mt-1 text-ink-500">{venue.city}</span>
                    <span className="mt-4 flex flex-wrap gap-2">
                      {venue.sports.map((venueSport) => (
                        <span
                          key={venueSport}
                          className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700"
                        >
                          {venueSport}
                        </span>
                      ))}
                    </span>
                  </Link>
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
    <nav aria-label="Stránkování" className="mt-8 flex items-center justify-between gap-4">
      {pageIndex > 0 ? (
        <Link href={hrefFor(pageIndex - 1)} className="button button-outline">
          Předchozí
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-muted">
        Strana {pageIndex + 1} z {pageCount}
      </span>
      {pageIndex + 1 < pageCount ? (
        <Link href={hrefFor(pageIndex + 1)} className="button button-outline">
          Další <ArrowRight size={18} aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
