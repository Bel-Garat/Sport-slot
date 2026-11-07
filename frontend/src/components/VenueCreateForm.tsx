"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle,
  CircleNotch,
  Clock,
  Copy,
  MapPin,
  Plus,
  WarningCircle,
} from "@phosphor-icons/react";
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
  type VenueFormValues,
} from "@/lib/venueForm";

type TextField = "name" | "address" | "city" | "description";

const inputClass =
  "min-h-12 w-full min-w-0 rounded-xl border border-line bg-page px-3.5 py-3 text-base text-foreground transition-colors placeholder:text-muted/65 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/20 focus:outline-none aria-invalid:border-red-600 aria-invalid:focus:ring-red-600/20 disabled:cursor-wait disabled:opacity-60";
const labelClass = "text-sm font-semibold text-foreground";
const errorClass = "text-sm text-red-700 dark:text-red-300";
const panelClass = "min-w-0 rounded-2xl border border-line p-5 sm:p-7";

export function VenueCreateForm() {
  const [values, setValues] = useState<VenueFormValues>(emptyVenueForm);
  const [showValidation, setShowValidation] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Venue | null>(null);
  const [hoursNotice, setHoursNotice] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const submittingRef = useRef(false);
  const errors = showValidation ? validateVenueForm(values) : {};
  const openDays = daysOfWeek.filter((day) => values.hours[day].open);
  const mondayValid = values.hours[1].open && values.hours[1].openTime && values.hours[1].closeTime > values.hours[1].openTime;

  useEffect(() => {
    if (created) successRef.current?.focus();
  }, [created]);

  function setText(field: TextField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setSubmitError(null);
  }

  function setDay(day: DayOfWeek, patch: Partial<DayHours>) {
    setValues((current) => ({
      ...current,
      hours: { ...current.hours, [day]: { ...current.hours[day], ...patch } },
    }));
    setSubmitError(null);
    setHoursNotice("");
  }

  function copyMondayToOpenDays() {
    setValues((current) => {
      const { openTime, closeTime } = current.hours[1];
      const hours = { ...current.hours };
      for (const day of daysOfWeek) {
        if (hours[day].open) hours[day] = { ...hours[day], openTime, closeTime };
      }
      return { ...current, hours };
    });
    setSubmitError(null);
    setHoursNotice("Pondělní časy jsou zkopírované do všech otevřených dnů.");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    const nextErrors = validateVenueForm(values);
    setShowValidation(true);
    setSubmitError(null);
    if (hasErrors(nextErrors)) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    try {
      setCreated(await createVenue(toVenueCreateDtoIn(values)));
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : "Sportoviště se nepodařilo uložit. Vaše údaje tu zůstaly, zkuste to znovu.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  function startOver() {
    setValues(emptyVenueForm());
    setShowValidation(false);
    setSubmitError(null);
    setHoursNotice("");
    setCreated(null);
    requestAnimationFrame(() => document.getElementById("venue-name")?.focus());
  }

  if (created) {
    return (
      <section className="mt-9 max-w-3xl rounded-2xl border border-line p-6 sm:p-9" aria-labelledby="venue-created-title">
        <span className="flex size-14 items-center justify-center rounded-full bg-ball text-brand-900"><Check size={28} aria-hidden="true" /></span>
        <p id="venue-created-status" className="mt-6 text-sm font-semibold text-muted">Sportoviště je založené</p>
        <h2 id="venue-created-title" ref={successRef} tabIndex={-1} aria-describedby="venue-created-status" className="mt-2 break-words font-display text-3xl leading-tight font-semibold tracking-tight">{created.name}</h2>
        <p className="mt-3 flex items-start gap-2 text-sm text-muted"><MapPin size={18} className="shrink-0" aria-hidden="true" />{created.address}, {created.city}</p>
        <div className="mt-7 border-t border-line pt-6">
          <h3 className="font-semibold">Teď přidejte první kurt nebo hřiště</h3>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">Doplňte sport, povrch a typ kurtu, aby hráči věděli, co si u vás mohou zahrát.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href={`/venues/${created.id}/courts/new`} className="button button-primary gap-2"><Plus size={18} aria-hidden="true" /> Přidat první kurt</Link>
            <Link href={`/venues/${created.id}`} className="button button-outline gap-2">Zobrazit sportoviště <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
        <button type="button" onClick={startOver} className="mt-5 inline-flex min-h-11 items-center rounded-lg text-sm text-muted underline underline-offset-4 hover:text-foreground">Založit další sportoviště</button>
      </section>
    );
  }

  return (
    <form ref={formRef} className="mt-9 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
      <fieldset disabled={submitting} className="grid min-w-0 gap-6">
        <legend className="sr-only">Údaje nového sportoviště</legend>
        {hasErrors(errors) && <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300"><WarningCircle size={19} className="shrink-0" aria-hidden="true" />Zkontrolujte zvýrazněná pole. Sportoviště ještě není uložené.</p>}

        <section className={panelClass} aria-labelledby="venue-info-title">
          <div className="mb-6 flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface"><MapPin size={21} aria-hidden="true" /></span>
            <div><h2 id="venue-info-title" className="font-display text-xl font-semibold tracking-tight">Základní údaje</h2><p className="mt-1 text-sm leading-relaxed text-muted">Takto vás hráči najdou. Název, adresa a město jsou povinné.</p></div>
          </div>
          <div className="grid gap-5">
            <TextInput id="venue-name" label="Název sportoviště" placeholder="Např. Sportcentrum Lužánky" value={values.name} maxLength={venueLimits.name} error={errors.name} autoComplete="organization" onChange={(value) => setText("name", value)} />
            <div className="grid gap-5 sm:grid-cols-[1.5fr_1fr]">
              <TextInput id="venue-address" label="Ulice a číslo" placeholder="Např. Sportovní 14" value={values.address} maxLength={venueLimits.address} error={errors.address} autoComplete="street-address" onChange={(value) => setText("address", value)} />
              <TextInput id="venue-city" label="Město" placeholder="Např. Brno" value={values.city} maxLength={venueLimits.city} error={errors.city} autoComplete="address-level2" onChange={(value) => setText("city", value)} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="venue-description" className={labelClass}>O sportovišti <span className="font-normal text-muted">(nepovinné)</span></label>
              <textarea id="venue-description" className={`${inputClass} min-h-32 resize-y leading-relaxed`} rows={4} placeholder="Představte své sportoviště. Máte šatny, parkování nebo občerstvení?" value={values.description} maxLength={venueLimits.description} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "venue-description-error" : "venue-description-hint"} onChange={(event) => setText("description", event.target.value)} />
              <div className="flex flex-wrap justify-between gap-2 text-xs text-muted">
                <p id="venue-description-hint">Pár vět pomůže hráčům s výběrem.</p>
                <span className="tabular-nums">{values.description.length} / {venueLimits.description}</span>
              </div>
              {errors.description && <p id="venue-description-error" className={errorClass}>{errors.description}</p>}
            </div>
          </div>
        </section>

        <fieldset className={panelClass}>
          <legend className="sr-only">Otevírací doba</legend>
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface"><Clock size={21} aria-hidden="true" /></span>
            <div><h2 aria-hidden="true" className="font-display text-xl font-semibold tracking-tight">Otevírací doba</h2><p className="mt-1 text-sm leading-relaxed text-muted">Zapněte dny, kdy máte otevřeno, a upravte časy.</p></div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-surface/70 p-3 sm:p-4">
            <button type="button" onClick={copyMondayToOpenDays} disabled={!mondayValid || submitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-page px-3 text-sm font-semibold transition-colors hover:border-muted disabled:cursor-not-allowed disabled:opacity-50"><Copy size={17} aria-hidden="true" /> Kopírovat pondělní časy</button>
            <p className="max-w-56 text-xs leading-relaxed text-muted">{mondayValid ? "Použijí se pro všechny otevřené dny. Zavřené dny zůstanou zavřené." : "Nejprve u pondělí nastavte platnou otevírací dobu."}</p>
          </div>
          <p role="status" className={`text-sm text-muted ${hoursNotice ? "mt-3" : "sr-only"}`}>{hoursNotice}</p>
          {errors.hours && <p id="venue-hours-error" className={`mt-4 ${errorClass}`}>{errors.hours}</p>}
          <ul className="mt-3 divide-y divide-line">
            {daysOfWeek.map((day) => {
              const hours = values.hours[day];
              const dayError = errors.days?.[day];
              const errorId = `venue-hours-${day}-error`;
              return (
                <li key={day} className="grid items-center gap-x-5 gap-y-2 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium">
                    <span className="relative flex shrink-0 items-center">
                      <input id={`venue-day-${day}`} type="checkbox" role="switch" className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0 disabled:cursor-wait" checked={hours.open} aria-invalid={Boolean(errors.hours)} aria-describedby={errors.hours ? "venue-hours-error" : undefined} onChange={(event) => setDay(day, { open: event.target.checked })} />
                      <span aria-hidden="true" className="h-6 w-10 rounded-full bg-line transition-colors peer-checked:bg-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-foreground peer-disabled:opacity-50" />
                      <span aria-hidden="true" className="absolute left-1 size-4 rounded-full bg-page shadow-sm transition-transform peer-checked:translate-x-4" />
                    </span>
                    {dayNames[day]}
                  </label>
                  {hours.open ? (
                    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                      <input type="time" className={`${inputClass} min-h-11 px-2 py-2 text-sm tabular-nums sm:px-3`} aria-label={`${dayNames[day]} – otevírá`} value={hours.openTime} aria-invalid={Boolean(dayError)} aria-describedby={dayError ? errorId : undefined} onChange={(event) => setDay(day, { openTime: event.target.value })} />
                      <span aria-hidden="true" className="text-muted">–</span>
                      <input type="time" className={`${inputClass} min-h-11 px-2 py-2 text-sm tabular-nums sm:px-3`} aria-label={`${dayNames[day]} – zavírá`} value={hours.closeTime} aria-invalid={Boolean(dayError)} aria-describedby={dayError ? errorId : undefined} onChange={(event) => setDay(day, { closeTime: event.target.value })} />
                    </div>
                  ) : <p className="flex min-h-11 items-center text-sm text-muted">Zavřeno</p>}
                  {dayError && <p id={errorId} className={`${errorClass} sm:col-span-2`}>{dayError}</p>}
                </li>
              );
            })}
          </ul>
        </fieldset>

        {submitError && <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"><WarningCircle size={20} className="shrink-0" aria-hidden="true" /><div><p className="font-semibold">Sportoviště se nepodařilo uložit</p><p className="mt-1 leading-relaxed">{submitError}</p></div></div>}

        <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-64 text-sm leading-relaxed text-muted">Nejprve uložte sportoviště. Kurty a hřiště přidáte hned poté.</p>
          <button type="submit" disabled={submitting} className="button button-primary gap-2 disabled:cursor-wait disabled:opacity-60">
            {submitting ? <><CircleNotch size={18} className="animate-spin" aria-hidden="true" /><span role="status">Ukládáme sportoviště…</span></> : <>Založit sportoviště <ArrowRight size={18} aria-hidden="true" /></>}
          </button>
        </div>
      </fieldset>

      <aside className="hidden rounded-2xl bg-surface/70 p-6 lg:sticky lg:top-26 lg:block" aria-labelledby="venue-preview-title">
        <p id="venue-preview-title" className="eyebrow">Vaše sportoviště</p>
        <h2 className="mt-4 break-words font-display text-2xl leading-tight font-semibold tracking-tight">{values.name.trim() || "Název sportoviště"}</h2>
        <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-muted"><MapPin size={17} className="mt-0.5 shrink-0" aria-hidden="true" /><span className="break-words">{[values.address.trim(), values.city.trim()].filter(Boolean).join(", ") || "Doplňte adresu a město"}</span></p>
        <p className="mt-4 flex items-center gap-2 text-sm text-muted"><Clock size={17} aria-hidden="true" />{openDays.length === 7 ? "Otevřeno každý den" : openDays.length === 0 ? "Zatím žádný otevřený den" : `Otevřeno ${openDays.length} ${openDays.length === 1 ? "den" : openDays.length < 5 ? "dny" : "dnů"} v týdnu`}</p>
        <div className="mt-6 border-t border-line pt-6">
          <p className="flex items-center gap-2 text-sm font-semibold"><CheckCircle size={19} aria-hidden="true" /> Co bude následovat?</p>
          <p className="mt-3 text-sm leading-6 text-muted">Po uložení přidáte jednotlivé kurty a hřiště. U každého vyberete sport, povrch a zda je venku, nebo v hale.</p>
        </div>
      </aside>
    </form>
  );
}

function TextInput({ id, label, placeholder, value, maxLength, error, autoComplete, onChange }: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  maxLength: number;
  error?: string;
  autoComplete?: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="grid min-w-0 gap-2">
      <label htmlFor={id} className={labelClass}>{label}</label>
      <input id={id} name={id} type="text" className={inputClass} placeholder={placeholder} value={value} maxLength={maxLength} autoComplete={autoComplete} required aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => onChange(event.target.value)} />
      {error && <p id={errorId} className={errorClass}>{error}</p>}
    </div>
  );
}
