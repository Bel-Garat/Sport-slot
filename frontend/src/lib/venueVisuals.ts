export const popularSports = [
  "tenis",
  "padel",
  "badminton",
  "volejbal",
  "fotbal",
  "basketbal",
  "squash",
];

const sportImages: { match: RegExp; src: string }[] = [
  { match: /tenis|tennis/i, src: "/images/tennis-hero.webp" },
  { match: /padel/i, src: "/images/padel.webp" },
  { match: /badminton|squash/i, src: "/images/badminton.webp" },
];

export function imageForSports(sports: string[]): string {
  for (const sport of sports) {
    const found = sportImages.find(({ match }) => match.test(sport));
    if (found) return found.src;
  }
  return "/images/community.webp";
}

export function capitalize(text: string): string {
  return text ? text.charAt(0).toLocaleUpperCase("cs") + text.slice(1) : text;
}
