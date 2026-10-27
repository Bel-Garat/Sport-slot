# Pravidla pro přispívání (Contributing)

Vítejte v repozitáři SportSlot! Abychom předešli konfliktům v kódu, dodržujte prosím následující pravidla:

## 1. Větvení (Branching)
Do větve `main` je zakázáno pushovat napřímo. Každý úkol ze SprintManu řešíme ve vlastní větvi:
* **Nové funkce:** `feature/<nazev-ukolu>` (např. `feature/zalozeni-sportoviste`)
* **Opravy chyb:** `bugfix/<nazev-chyby>` (např. `bugfix/oprava-formulare`)

## Pravidla pro commity
Každá commit zpráva musí začínat jedním z následujících prefixů podle toho, co přesně mění:
* **feat:** Přidání nové funkcionality (např. `feat: založení endpointu pro kurty`)
* **fix:** Oprava chyby (např. `fix: oprava padání vyhledávání`)
* **refactor:** Úprava struktury kódu bez změny chování (např. `refactor: přepsání komponenty detailu`)
* **chore:** Pomocné práce, konfigurace, úprava dokumentace (např. `chore: aktualizace README`)

## 3. Pull Requesty (PR)
1. Svou hotovou větev pushněte na GitHub.
2. Otevřete Pull Request směřující do větve `main`.
3. Pečlivě vyplňte automatickou PR šablonu (zejména jak kód otestovat a odkaz na úkol).
4. Než PR mergnete, musí ho zkontrolovat a schválit (Approve) minimálně 1 další člen týmu.