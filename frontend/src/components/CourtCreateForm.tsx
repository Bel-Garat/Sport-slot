"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import { courtLimits, createCourt, type CreatedCourt } from "@/lib/courts";

type CourtField = keyof typeof courtLimits;

type CourtFormValues = Record<CourtField, string> & { indoor: boolean };

type CourtFormErrors = Partial<Record<CourtField, string>>;

const fieldLabels: Record<CourtField, { label: string; placeholder: string }> = {
  name: { label: "Název", placeholder: "Např. Kurt 1" },
  sport: { label: "Sport", placeholder: "Např. tenis, nohejbal" },
  surface: { label: "Povrch", placeholder: "Např. antuka" },
};

const inputClass =
  "w-full rounded-xl border border-brand-200 bg-white px-3.5 py-2.5 text-ink-900 shadow-xs transition placeholder:text-ink-500/60 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/20 focus:outline-none aria-invalid:border-red-600 aria-invalid:focus:ring-red-600/20";
const labelClass = "text-sm font-semibold text-brand-900";
const errorClass = "text-sm text-red-700";
const cardClass = "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-100 sm:p-8";
const primaryButtonClass =
  "inline-flex items-center justify-center rounded-full bg-brand-900 px-6 py-3 font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-wait disabled:opacity-60";
const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-900 transition hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";
const linkClass =
  "font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-900";

function emptyCourtForm(): CourtFormValues {
  return { name: "", sport: "", surface: "", indoor: false };
}

function validateCourtForm(values: CourtFormValues): CourtFormErrors {
  const errors: CourtFormErrors = {};
  for (const field of Object.keys(courtLimits) as CourtField[]) {
    const value = values[field].trim();
    if (!value) {
      errors[field] = "Pole je povinné.";
    } else if (value.length > courtLimits[field]) {
      errors[field] = `Maximálně ${courtLimits[field]} znaků.`;
    }
  }
  return errors;
}

export function CourtCreateForm({ venueId }: { venueId: string }) {
  const [values, setValues] = useState<CourtFormValues>(emptyCourtForm);
  const [errors, setErrors] = useState<CourtFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatedCourt | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateCourtForm(values);
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setSubmitting(true);
    try {
      setCreated(
        await createCourt({
          venueId,
          name: values.name.trim(),
          sport: values.sport.trim(),
          surface: values.surface.trim(),
          indoor: values.indoor,
        }),
      );
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Kurt se nepodařilo uložit. Zkuste to znovu.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function startOver() {
    setValues(emptyCourtForm());
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
          Kurt {created.name} je přidaný
        </h2>
        <p className="mt-2 text-ink-500">
          {created.sport} · {created.surface} ·{" "}
          {created.indoor ? "vnitřní" : "venkovní"}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" className={secondaryButtonClass} onClick={startOver}>
            Přidat další kurt
          </button>
          <Link href={`/venues/${venueId}`} className={linkClass}>
            Zobrazit sportoviště
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form className={`${cardClass} mt-8 grid gap-5`} onSubmit={handleSubmit} noValidate>
      {(Object.keys(fieldLabels) as CourtField[]).map((field) => {
        const id = `court-${field}`;
        const errorId = `${id}-error`;
        return (
          <div key={field} className="grid gap-1.5">
            <label htmlFor={id} className={labelClass}>
              {fieldLabels[field].label}
            </label>
            <input
              id={id}
              type="text"
              className={inputClass}
              placeholder={fieldLabels[field].placeholder}
              value={values[field]}
              maxLength={courtLimits[field]}
              required
              aria-invalid={Boolean(errors[field])}
              aria-describedby={errors[field] ? errorId : undefined}
              onChange={(event) =>
                setValues((current) => ({ ...current, [field]: event.target.value }))
              }
            />
            {errors[field] && (
              <p id={errorId} className={errorClass}>
                {errors[field]}
              </p>
            )}
          </div>
        );
      })}

      <label className="flex min-h-11 items-center gap-3">
        <input
          type="checkbox"
          className="size-5 accent-brand-700"
          checked={values.indoor}
          onChange={(event) =>
            setValues((current) => ({ ...current, indoor: event.target.checked }))
          }
        />
        <span className="font-medium text-ink-900">Vnitřní (krytý) kurt</span>
      </label>

      {submitError && (
        <p role="alert" className="font-medium text-red-700">
          {submitError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className={primaryButtonClass} disabled={submitting}>
          {submitting ? "Ukládám…" : "Přidat kurt"}
        </button>
        <Link href={`/venues/${venueId}`} className={linkClass}>
          Zpět na sportoviště
        </Link>
      </div>
    </form>
  );
}
