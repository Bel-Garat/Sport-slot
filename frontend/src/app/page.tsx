import Link from "next/link";

const primaryCta =
  "inline-flex items-center justify-center rounded-full bg-ball px-6 py-3 font-semibold text-brand-900 shadow-sm transition hover:bg-[#b6e33a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ball";
const secondaryCta =
  "inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const sports = ["Tenis", "Badminton", "Squash", "Padel", "Volejbal"];

const steps = [
  {
    title: "Najděte sportoviště",
    text: "Zadejte město a sport. SportSlot ukáže sportoviště ve vašem okolí i s adresou, kurty a otevírací dobou.",
  },
  {
    title: "Vyberte volný termín",
    text: "Vidíte jen časy, které jsou opravdu volné, a rovnou i cenu. Žádné „ozveme se vám“.",
  },
  {
    title: "Zahrajte si",
    text: "Rezervace je potvrzená hned. Když se plány změní, zrušíte ji jedním klikem v Mých rezervacích.",
  },
];

const managerBenefits = [
  {
    title: "Sportoviště online za pár minut",
    text: "Založíte sportoviště, kurty a otevírací dobu. Jakmile přidáte první kurt, hráči vás najdou ve vyhledávání.",
  },
  {
    title: "Ceník a termíny na jednom místě",
    text: "Nastavíte ceny kurtů a SportSlot hráčům nabízí jen časy, kdy máte otevřeno a volno.",
  },
  {
    title: "Méně telefonů, žádné dvojité rezervace",
    text: "Hráči si rezervují sami a jeden termín nejde zabrat dvakrát. Recepce se může věnovat lidem na místě.",
  },
  {
    title: "Přehled o každé změně",
    text: "Každá rezervace i zrušení se zapisuje do audit logu, takže víte, kdo co a kdy udělal.",
  },
];

const slots = [
  { time: "16:00", free: false },
  { time: "17:00", free: true },
  { time: "18:00", free: false },
  { time: "19:00", free: true },
  { time: "20:00", free: true },
  { time: "21:00", free: false },
];

function CourtIllustration() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-md rounded-3xl bg-white/5 p-5 ring-1 ring-white/15"
    >
      <svg viewBox="0 0 320 180" className="w-full">
        <rect x="4" y="4" width="312" height="172" rx="10" fill="#15804a" />
        <rect
          x="24"
          y="22"
          width="272"
          height="136"
          fill="none"
          stroke="white"
          strokeWidth="3"
        />
        <path
          d="M160 22v136M24 52h272M24 128h272M92 52v76M228 52v76M92 90h136"
          stroke="white"
          strokeWidth="2.5"
          fill="none"
          opacity="0.9"
        />
        <circle cx="238" cy="70" r="9" fill="var(--color-ball)" />
      </svg>
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        {slots.map((slot) => (
          <span
            key={slot.time}
            className={
              slot.free
                ? "rounded-lg bg-ball px-2 py-1.5 text-center font-semibold text-brand-900"
                : "rounded-lg bg-white/10 px-2 py-1.5 text-center text-white/50 line-through"
            }
          >
            {slot.time}
          </span>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-white/60">
        Ilustrace: zelené časy jsou volné
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <section className="bg-brand-900 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-ball">
              Rezervace sportovišť bez telefonování
            </p>
            <h1 className="mt-6 font-display text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
              Kurt na dnešní večer? Máte ho za minutu.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-pretty text-white/80">
              SportSlot ukáže sportoviště ve vašem městě, jejich volné termíny
              a ceny. Vyberete si čas, zarezervujete a jdete hrát – bez volání
              na recepci a bez čekání na odpověď na e-mail.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#jak-to-funguje" className={primaryCta}>
                Jak to funguje
              </Link>
              <Link href="#pro-spravce" className={secondaryCta}>
                Mám sportoviště
              </Link>
            </div>
            <ul className="mt-10 flex flex-wrap gap-2 text-sm text-white/70">
              {sports.map((sport) => (
                <li
                  key={sport}
                  className="rounded-full border border-white/15 px-3 py-1"
                >
                  {sport}
                </li>
              ))}
              <li className="px-1 py-1">a další</li>
            </ul>
          </div>
          <CourtIllustration />
        </div>
      </section>

      <section
        id="jak-to-funguje"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20"
      >
        <p className="font-semibold text-brand-600">Pro hráče</p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
          Od nápadu „jdeme si zahrát“ k potvrzené rezervaci ve třech krocích
        </h2>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-100"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-900 font-display text-lg font-bold text-ball">
                {index + 1}
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-brand-900">
                {step.title}
              </h3>
              <p className="mt-2 text-ink-500">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="pro-spravce" className="scroll-mt-20 bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-[2fr_3fr]">
          <div>
            <p className="font-semibold text-brand-600">Pro správce sportovišť</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
              Méně telefonů, víc odehraných hodin.
            </h2>
            <p className="mt-4 text-lg text-ink-500">
              Dejte hráčům možnost rezervovat si sami. Vy nastavíte kurty,
              otevírací dobu a ceník, o zbytek se postará SportSlot.
            </p>
            <Link
              href="/venues/new"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-brand-900 px-6 py-3 font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              Přidat sportoviště
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {managerBenefits.map((benefit) => (
              <li
                key={benefit.title}
                className="rounded-2xl bg-brand-50 p-6 ring-1 ring-brand-100"
              >
                <h3 className="font-display text-lg font-semibold text-brand-900">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-ink-500">{benefit.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-brand-900 px-8 py-12 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Máte sportoviště? Ukažte ho hráčům.
            </h2>
            <p className="mt-2 text-white/75">
              Založení zabere pár minut. Stačí název, adresa a otevírací doba.
            </p>
          </div>
          <Link href="/venues/new" className={primaryCta}>
            Přidat sportoviště
          </Link>
        </div>
      </section>
    </main>
  );
}
