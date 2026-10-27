# SportSlot 

## Pravidla pro větve
* Nové funkce vyvíjíme ve větvích s prefixem: `feature/<nazev-ukolu>`
* Opravy chyb: `bugfix/<nazev-chyby>`

## Pravidla pro commity
Každá commit zpráva musí začínat jedním z následujících prefixů podle toho, co přesně mění:
* **feat:** Přidání nové funkcionality (např. `feat: založení endpointu pro kurty`)
* **fix:** Oprava chyby (např. `fix: oprava padání vyhledávání`)
* **refactor:** Úprava struktury kódu bez změny chování (např. `refactor: přepsání komponenty detailu`)
* **chore:** Pomocné práce, konfigurace, úprava dokumentace (např. `chore: aktualizace README`)

## Jak otevřít Pull Request (PR)
1. Pushněte svou branch na GitHub.
2. Otevřete PR proti větvi `main`.
3. Vyplňte automatickou šablonu.
4. Před mergem musí PR schválit minimálně 1 další člen týmu.
