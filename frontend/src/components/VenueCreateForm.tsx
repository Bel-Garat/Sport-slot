"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ApiError, createVenue, type DayOfWeek, type Venue } from "@/lib/api";
import {
  dayNames,
  daysOfWeek,
  emptyVenueForm,
  hasErrors,
  toVenueCreateDtoIn,
  validateVenueForm,
  venueLimits,
  type DayHours,
  type VenueFormErrors,
  type VenueFormValues,
} from "@/lib/venueForm";

type TextField = "name" | "address" | "city" | "description";

const inputClass =
  "w-full rounded-xl border border-brand-200 bg-white px-3.5 py-2.5 text-ink-900 shadow-xs transition placeholder:text-ink-500/60 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/20 focus:outline-none aria-invalid:border-red-600 aria-invalid:focus:ring-red-600/20";
const timeInputClass = `${inputClass} w-auto tabular-nums`;
const labelClass = "text-sm font-semibold text-brand-900";
const errorClass = "text-sm text-red-700";
const cardClass = "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-100 sm:p-8";
const sectionTitleClass = "font-display text-xl font-semibold text-brand-900";
const primaryButtonClass =
  "inline-flex items-center justify-center rounded-full bg-brand-900 px-6 py-3 font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-wait disabled:opacity-60";
const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-900 transition hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";
const linkClass =
  "font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-900";

export function VenueCreateForm() {
  const [values, setValues] = useState<VenueFormValues>(emptyVenueForm);
  const [errors, setErrors] = useState<VenueFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Venue | null>(null);

  function setText(field: TextField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function setDay(day: DayOfWeek, patch: Partial<DayHours>) {
    setValues((current) => ({
      ...current,
      hours: { ...current.hours, [day]: { ...current.hours[day], ...patch } },
    }));
  }

  function copyMondayToOpenDays() {
    setValues((current) => {
      const { openTime, closeTime } = current.hours[1];
      const hours = { ...current.hours };
      for (const day of daysOfWeek) {
        if (hours[day].open) {
          hours[day] = { ...hours[day], openTime, closeTime };
        }
      }
      return { ...current, hours };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateVenueForm(values);
    setErrors(nextErrors);
    setSubmitError(null);
    if (hasErrors(nextErrors)) {
      return;
    }
    setSubmitting(true);
    try {
      setCreated(await createVenue(toVenueCreateDtoIn(values)));
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Sportoviště se nepodařilo uložit. Zkuste to znovu.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function startOver() {
    setValues(emptyVenueForm());
    setErrors({});
    setCreated(null);
  }

  if (created) {
    return (
      <section className={`${cardClass} mt-8`} role="status">
        <span className="flex size-12 items-center justify-center rounded-full bg-ball font-display text-2xl font-bold text-brand-900">
          ✓
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold text-brand-900">
          Sportoviště {created.name} je založené
        </h2>
        <p className="mt-2 text-ink-500">
          {created.address}, {created.city}. Dalším krokem je přidat kurty –
          teprve pak vás hráči uvidí ve vyhledávání.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            href={`/venues/${created.id}/courts/new`}
            className={primaryButtonClass}
          >
            Přidat kurt
          </Link>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={startOver}
          >
            Založit další sportoviště
          </button>
          <Link href={`/venues/${created.id}`} className={linkClass}>
            Zobrazit sportoviště
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form className="mt-8 grid gap-6" onSubmit={handleSubmit} noValidate>
      <section className={`${cardClass} grid gap-5`}>
        <h2 className={sectionTitleClass}>Základní údaje</h2>
        <TextInput
          id="venue-name"
          label="Název"
          placeholder="Např. Sportcentrum Lužánky"
          value={values.name}
          maxLength={venueLimits.name}
          error={errors.name}
          onChange={(value) => setText("name", value)}
        />
        <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
          <TextInput
            id="venue-address"
            label="Adresa"
            placeholder="Ulice a číslo popisné"
            value={values.address}
            maxLength={venueLimits.address}
            error={errors.address}
            onChange={(value) => setText("address", value)}
          />
          <TextInput
            id="venue-city"
            label="Město"
            placeholder="Např. Brno"
            value={values.city}
            maxLength={venueLimits.city}
            error={errors.city}
            onChange={(value) => setText("city", value)}
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="venue-description" className={labelClass}>
            Popis <span className="font-normal text-ink-500">(nepovinné)</span>
          </label>
          <textarea
            id="venue-description"
            className={inputClass}
            rows={4}
            placeholder="Co hráče u vás čeká – povrchy, šatny, parkování, občerstvení…"
            value={values.description}
            maxLength={venueLimits.description}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? "venue-description-error" : undefined
            }
            onChange={(event) => setText("description", event.target.value)}
          />
          <div className="flex justify-between gap-4">
            {errors.description ? (
              <p id="venue-description-error" className={errorClass}>
                {errors.description}
              </p>
            ) : (
              <span />
            )}
            <span className="text-xs text-ink-500 tabular-nums">
              {values.description.length} / {venueLimits.description}
            </span>
          </div>
        </div>
      </section>

      <fieldset className={`${cardClass} grid gap-4`}>
        <legend className="sr-only">Otevírací doba</legend>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className={sectionTitleClass} aria-hidden="true">
            Otevírací doba
          </h2>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={copyMondayToOpenDays}
          >
            Pondělní čas na všechny otevřené dny
          </button>
        </div>
        {errors.hours && (
          <p className={errorClass} role="alert">
            {errors.hours}
          </p>
        )}
        <ul className="divide-y divide-brand-100">
          {daysOfWeek.map((day) => {
            const hours = values.hours[day];
            const dayError = errors.days?.[day];
            const errorId = `venue-hours-${day}-error`;
            return (
              <li
                key={day}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3"
              >
                <label className="flex w-32 cursor-pointer items-center gap-3 font-medium text-ink-900">
                  <input
                    type="checkbox"
                    className="size-4 accent-brand-600"
                    checked={hours.open}
                    onChange={(event) =>
                      setDay(day, { open: event.target.checked })
                    }
                  />
                  {dayNames[day]}
                </label>
                {hours.open ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      className={timeInputClass}
                      aria-label={`${dayNames[day]} – otevírá`}
                      value={hours.openTime}
                      aria-invalid={Boolean(dayError)}
                      aria-describedby={dayError ? errorId : undefined}
                      onChange={(event) =>
                        setDay(day, { openTime: event.target.value })
                      }
                    />
                    <span aria-hidden="true" className="text-ink-500">
                      –
                    </span>
                    <input
                      type="time"
                      className={timeInputClass}
                      aria-label={`${dayNames[day]} – zavírá`}
                      value={hours.closeTime}
                      aria-invalid={Boolean(dayError)}
                      aria-describedby={dayError ? errorId : undefined}
                      onChange={(event) =>
                        setDay(day, { closeTime: event.target.value })
                      }
                    />
                  </div>
                ) : (
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-sm text-ink-500">
                    Zavřeno
                  </span>
                )}
                {dayError && (
                  <p id={errorId} className={`${errorClass} basis-full`}>
                    {dayError}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </fieldset>

      {submitError && (
        <p
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200"
          role="alert"
        >
          {submitError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className={primaryButtonClass}
          disabled={submitting}
        >
          {submitting ? "Ukládání…" : "Založit sportoviště"}
        </button>
        <p className="text-sm text-ink-500">
          Kurty a ceník přidáte v dalším kroku.
        </p>
      </div>
    </form>
  );
}

function TextInput({
  id,
  label,
  placeholder,
  value,
  maxLength,
  error,
  onChange,
}: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  maxLength: number;
  error?: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        className={inputClass}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <p id={errorId} className={errorClass}>
          {error}
        </p>
      )}
    </div>
  );
}
