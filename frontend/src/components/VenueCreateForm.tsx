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
  "rounded-md border border-gray-300 px-2.5 py-2 aria-invalid:border-red-700";
const errorClass = "text-sm text-red-700";
const buttonClass =
  "cursor-pointer rounded-md bg-gray-900 px-4 py-2 text-white disabled:cursor-wait disabled:opacity-60";
const linkClass = "underline";

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
      <section
        className="mt-6 rounded-md border border-green-200 bg-green-50 p-4"
        role="status"
      >
        <p>
          Sportoviště <strong>{created.name}</strong> bylo založeno.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <button type="button" className={buttonClass} onClick={startOver}>
            Založit další sportoviště
          </button>
          <Link href="/" className={linkClass}>
            Zpět na úvodní stránku</Link>
        </div>
      </section>
    );
  }

  return (
    <form
      className="mt-6 grid max-w-xl gap-4"
      onSubmit={handleSubmit}
      noValidate
    >
      <TextInput
        id="venue-name"
        label="Název"
        value={values.name}
        maxLength={venueLimits.name}
        error={errors.name}
        required
        onChange={(value) => setText("name", value)}
      />
      <TextInput
        id="venue-address"
        label="Adresa"
        value={values.address}
        maxLength={venueLimits.address}
        error={errors.address}
        required
        onChange={(value) => setText("address", value)}
      />
      <TextInput
        id="venue-city"
        label="Město"
        value={values.city}
        maxLength={venueLimits.city}
        error={errors.city}
        required
        onChange={(value) => setText("city", value)}
      />
      <div className="grid gap-1">
        <label htmlFor="venue-description">Popis (nepovinné)</label>
        <textarea
          id="venue-description"
          className={inputClass}
          rows={4}
          value={values.description}
          maxLength={venueLimits.description}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? "venue-description-error" : undefined
          }
          onChange={(event) => setText("description", event.target.value)}
        />
        {errors.description && (
          <p id="venue-description-error" className={errorClass}>
            {errors.description}
          </p>
        )}
      </div>

      <fieldset className="grid gap-2 rounded-md border border-gray-200 px-4 py-3">
        <legend className="px-1">Otevírací doba</legend>
        {errors.hours && <p className={errorClass}>{errors.hours}</p>}
        {daysOfWeek.map((day) => {
          const hours = values.hours[day];
          const dayError = errors.days?.[day];
          const errorId = `venue-hours-${day}-error`;
          return (
            <div key={day} className="flex flex-wrap items-center gap-2">
              <label className="flex min-w-30 items-center gap-2">
                <input
                  type="checkbox"
                  checked={hours.open}
                  onChange={(event) =>
                    setDay(day, { open: event.target.checked })
                  }
                />
                {dayNames[day]}
              </label>
              {hours.open ? (
                <>
                  <input
                    type="time"
                    className={inputClass}
                    aria-label={`${dayNames[day]} – otevírá`}
                    value={hours.openTime}
                    aria-invalid={Boolean(dayError)}
                    aria-describedby={dayError ? errorId : undefined}
                    onChange={(event) =>
                      setDay(day, { openTime: event.target.value })
                    }
                  />
                  <span aria-hidden="true">–</span>
                  <input
                    type="time"
                    className={inputClass}
                    aria-label={`${dayNames[day]} – zavírá`}
                    value={hours.closeTime}
                    aria-invalid={Boolean(dayError)}
                    aria-describedby={dayError ? errorId : undefined}
                    onChange={(event) =>
                      setDay(day, { closeTime: event.target.value })
                    }
                  />
                </>
              ) : (
                <span className="text-gray-500">Zavřeno</span>
              )}
              {dayError && (
                <p id={errorId} className={`${errorClass} basis-full`}>
                  {dayError}
                </p>
              )}
            </div>
          );
        })}
      </fieldset>

      {submitError && (
        <p className={errorClass} role="alert">
          {submitError}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button type="submit" className={buttonClass} disabled={submitting}>
          {submitting ? "Ukládání…" : "Založit sportoviště"}
        </button>
      </div>
    </form>
  );
}

function TextInput({
  id,
  label,
  value,
  maxLength,
  error,
  required,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  maxLength: number;
  error?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="grid gap-1">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        className={inputClass}
        value={value}
        maxLength={maxLength}
        required={required}
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
