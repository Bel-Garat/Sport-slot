import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarCheck, MapPin, Plus, TennisBall } from "@phosphor-icons/react/dist/ssr";
import { LogoMark } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { HeroMedia } from "@/components/HeroMedia";
import { SportExplorer } from "@/components/SportExplorer";
import { OwnerCta } from "@/components/OwnerCta";

const steps = [
  { icon: MapPin, title: "Najdi svoje místo.", text: "Vyber sport a město. Objev kurt, kam to máš blízko a kde se ti bude dobře hrát." },
  { icon: CalendarCheck, title: "Udělej si čas.", text: "Vyber si termín, který sedí tobě i parťákům. Cena i délka hry patří na jedno místo." },
  { icon: TennisBall, title: "Zbytek nech na kurtu.", text: "Sbal raketu, pozvi kamaráda a vyraz. Nejlepší část rezervace je to, co přijde po ní." },
];
const faqs = [
  { question: "Co je SportSlot?", answer: "SportSlot je vznikající platforma pro rezervace sportovišť. Spojuje hráče, kteří hledají místo pro svou další hru, se správci kurtů a sportovních areálů." },
  { question: "Můžu si už rezervovat skutečný kurt?", answer: "Zatím si můžeš vyzkoušet interaktivní ukázku na této stránce. Zobrazená města a časy jsou ukázková data. Skutečné rezervace budou dostupné po spuštění rezervačního systému." },
  { question: "Jaké sporty tu najdu?", answer: "Počítáme s tenisem, padelem, badmintonem, squashem i volejbalem. Konkrétní nabídka bude záviset na sportovištích, která se do SportSlotu zapojí." },
  { question: "Jak přidám své sportoviště?", answer: "Přihlášený správce může vyplnit název, adresu, popis a otevírací dobu ve formuláři pro nové sportoviště. Veřejnou registraci správců zatím připravujeme." },
];

export default function Home() {
  return (
    <main id="main-content">
      <section aria-labelledby="hero-title" className="mx-auto max-w-[1440px] px-3 pt-3 sm:px-5 sm:pt-5 md:px-6">
        <div className="relative isolate flex min-h-[590px] flex-col justify-center overflow-hidden rounded-[24px] bg-brand-900 text-white sm:min-h-[620px] lg:min-h-[min(640px,80dvh)]">
          <HeroMedia />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,31,21,.82)_0%,rgba(8,31,21,.48)_48%,rgba(8,31,21,.03)_100%)]" />
          <div className="hero-copy max-w-[880px] px-6 pt-14 pb-30 sm:px-10 md:px-16 md:pt-12 md:pb-24">
            <p className="mb-7 text-xs font-semibold tracking-[.18em] uppercase text-white/85">Tvůj čas. Tvoje hra.</p>
            <h1 id="hero-title" className="max-w-[800px] font-display text-[clamp(2.7rem,6.4vw,5.75rem)] leading-[1.05] font-semibold tracking-[-.055em]">Méně domlouvání.<br /><span className="text-ball">Více hraní.</span></h1>
            <p className="mt-7 max-w-80 text-base leading-relaxed text-white/85 sm:max-w-96 sm:text-lg">Najdi svůj sport, vyber si čas a vyraz.<br className="hidden sm:block" /> Na kurt patří hra. Ne domlouvání.</p>
            <Link href="#sporty" className="button button-primary hero-cta mt-8">Najdi svůj sport <ArrowUpRight size={21} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section id="sporty" aria-labelledby="sports-title" className="section-wrap scroll-mt-28 pt-20 pb-20 md:pt-28 md:pb-28">
        <Reveal><p className="eyebrow">Pro radost ze hry</p><h2 id="sports-title" className="section-heading mt-4">Na co máš dnes chuť?</h2><p className="mt-4 max-w-xl text-base leading-relaxed text-muted">Na známý kurt, nebo něco úplně nového? Vyber si sport a vyzkoušej, jak jednoduchá může rezervace být.</p></Reveal>
        <Reveal delay={80} stagger=":scope > div > button"><SportExplorer /></Reveal>
      </section>

      <section id="jak-to-funguje" aria-labelledby="how-title" className="scroll-mt-24 border-y border-line bg-surface">
        <div className="section-wrap py-20 md:py-28">
          <Reveal className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-24" stagger=":scope > div, li">
            <div className="lg:sticky lg:top-32 lg:self-start"><h2 id="how-title" className="section-heading max-w-md">Od „jdeme hrát?“<br />rovnou ke hře.</h2><p className="mt-6 max-w-sm text-base leading-relaxed text-muted">Méně zpráv ve skupině. Méně volání na recepci. Více času na to, kvůli čemu ses vlastně domluvil.</p><Link href="#sporty" className="mt-7 inline-flex min-h-11 items-center gap-3 text-sm font-semibold underline decoration-line underline-offset-8 hover:decoration-current">Vyzkoušet ukázku <ArrowRight size={18} aria-hidden="true" /></Link></div>
            <ol className="grid gap-8">{steps.map(({icon: Icon,title,text},index) => <li key={title} className="grid grid-cols-[52px_1fr] gap-5 border-b border-line pb-8 last:border-0 last:pb-0"><span className="flex size-12 items-center justify-center rounded-full bg-page text-foreground"><Icon size={24} weight="regular" aria-hidden="true" /></span><div><span className="sr-only">Krok {index + 1}. </span><h3 className="font-display text-2xl font-semibold tracking-tight">{title}</h3><p className="mt-3 max-w-md text-sm leading-7 text-muted">{text}</p></div></li>)}</ol>
          </Reveal>
        </div>
      </section>

      <section id="o-sportslotu" aria-labelledby="about-title" className="section-wrap scroll-mt-24 py-20 md:py-28">
        <Reveal className="grid items-center gap-10 md:grid-cols-[1.1fr_.9fr] md:gap-16">
          <div className="relative aspect-[6/5] overflow-hidden rounded-2xl bg-brand-900"><Image src="/images/community.webp" alt="Tři přátelé se po tenisu smějí u sítě" fill sizes="(max-width: 767px) 100vw, 55vw" className="object-cover" /></div>
          <div><LogoMark className="mb-8 size-12 text-brand-600" /><h2 id="about-title" className="section-heading">Nejde jen<br />o skóre.</h2><p className="mt-6 max-w-md text-base leading-7 text-muted">Jde o ten pocit po zápase. O smích u sítě. O hodinu, kdy jsi byl hlavou úplně jinde.</p><p className="mt-4 max-w-md text-base leading-7 text-muted">SportSlot vzniká pro všechny, kteří chtějí sport dostat zpátky do svého týdne. Ať hraješ na body, nebo jen tak.</p><p className="mt-8 font-display text-xl font-semibold">Tvůj další dobrý den začíná hrou.</p></div>
        </Reveal>
      </section>

      <section id="pro-spravce" aria-labelledby="owners-title" className="section-wrap scroll-mt-28 pb-20 md:pb-28">
        <Reveal className="relative isolate overflow-hidden rounded-[24px] bg-[#173b2b] p-7 text-white sm:p-10 md:p-14">
          <div className="pointer-events-none absolute -top-30 -right-16 -z-10 size-[560px] rotate-[-18deg] text-white/[.035]" aria-hidden="true"><LogoMark className="size-full" /></div>
          <div className="grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:gap-20">
            <div><p className="text-xs font-semibold tracking-[.16em] uppercase text-ball">Pro správce sportovišť</p><h2 id="owners-title" className="mt-5 font-display text-[clamp(2.2rem,4.4vw,3.8rem)] leading-[1.08] font-semibold tracking-[-.045em]">Váš kurt.<br />Jejich nejlepší<br className="hidden lg:block" /> hodina dne.</h2><p className="mt-6 max-w-md text-base leading-7 text-white/75">Dejte hráčům prostor pro další zápas. SportSlot připravujeme tak, aby správa sportoviště zabrala méně času než samotná hra.</p><div className="mt-8"><OwnerCta /></div></div>
            <div className="grid gap-7 border-t border-white/20 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">{[{title:"Sportoviště na jednom místě",text:"Název, adresa, popis i otevírací doba přehledně pro vaše hráče."},{title:"Více prostoru pro hráče",text:"Srozumitelná nabídka kurtů místo opakovaného vysvětlování po telefonu."},{title:"Připraveno na váš provoz",text:"Otevírací doba pro každý den zvlášť. Vy určujete, kdy se u vás hraje."}].map(item=><div key={item.title}><h3 className="font-display text-xl font-semibold">{item.title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-white/70">{item.text}</p></div>)}</div>
          </div>
        </Reveal>
      </section>

      <section id="otazky" aria-labelledby="faq-title" className="section-wrap scroll-mt-28 pb-20 md:pb-28">
        <Reveal className="grid gap-8 md:grid-cols-[.75fr_1.25fr] md:gap-20" stagger="h2, details"><h2 id="faq-title" className="section-heading">Ještě něco<br />před hrou?</h2><div>{faqs.map(item=><details key={item.question} className="faq group border-b border-line first:border-t"><summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-5 py-5 text-base font-medium [&::-webkit-details-marker]:hidden">{item.question}<span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line transition-[transform,background-color,border-color,color] duration-300 ease-[cubic-bezier(.16,1,.3,1)] group-hover:border-foreground group-open:rotate-45 group-open:border-ball group-open:bg-ball group-open:text-brand-900"><Plus size={18} /></span></summary><p className="faq-answer max-w-xl pb-6 pr-8 text-sm leading-7 text-muted">{item.answer}</p></details>)}</div></Reveal>
      </section>
      <section aria-label="Výzva ke hře" className="border-t border-line bg-surface"><div className="section-wrap flex flex-col items-start justify-between gap-8 py-14 md:flex-row md:items-center md:py-18"><h2 className="font-display text-[clamp(2.2rem,4.6vw,4rem)] leading-tight font-semibold tracking-[-.045em]">Tak co, dáme hru?</h2><Link href="#sporty" className="button button-dark">Jdu do toho <ArrowUpRight size={20} aria-hidden="true" /></Link></div></section>
    </main>
  );
}
