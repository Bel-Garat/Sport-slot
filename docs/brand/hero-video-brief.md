# Hero: nekonečná tenisová výměna

## Stav

Hotovo 4. 11. 2026: `court-loop.mp4` je vygenerovaný AI záběr tenistky shora (5 s, 1280 × 720). Zrychleno na 1,25× a pro plynulou smyčku je posledních 0,5 s prolnuto se začátkem (výsledek 3,5 s). Plakát `frontend/public/images/hero-poster.webp` je první snímek smyčky.

## Podklad

`frontend/public/images/tennis-hero.webp` je schválený obrazový směr: dospělá tenistka na pravé straně zeleného kurtu, bílé čáry, pozdní odpolední světlo. Levá část zůstává pro nadpis a CTA.

## Zadání pro image-to-video

Use the supplied image as the identity, wardrobe, court and lighting reference. Create an 8-second photorealistic tennis action loop for a sports-booking website background. A single adult woman on the RIGHT THIRD of a deep green outdoor tennis court plays a natural forehand, follows through, makes a small recovery step and returns to the starting phase of the same relaxed rally. Correct tennis biomechanics, stable face and body proportions, one racket with stable strings and handle, one yellow tennis ball following a plausible continuous path. Her ivory top, forest-green shorts and shoes remain identical. Preserve all court lines and the late-afternoon shadow direction. Locked-off high oblique camera; NO cuts, NO camera zoom, NO scene transition. Keep the LEFT 60 PERCENT of the frame quiet green court with no people or moving objects. The first and last frame must match in body position, racket position, court geometry, lighting and camera framing for a seamless repeated loop. Gentle believable sporting motion; no excessive slow motion. No text, no logos, no audio. Landscape 16:9.

If the chosen video model supports first/last frame conditioning, use the same reference for both. Otherwise inspect the action and select a genuinely matching loop point. Do not reverse the shot: a backwards tennis ball or backwards recovery step breaks the realism.

## Výstup

- 8 až 10 sekund, 24 nebo 30 fps, bez zvuku.
- MP4 / H.264, `yuv420p`, fast-start, 1536 × 864 nebo 1920 × 1080.
- Cílová velikost přibližně 1 až 3 MB.
- Nahradit `frontend/public/media/court-loop.mp4`.
- Případně aktualizovat `tennis-hero.webp`, aby první načtení a přechod do videa nenaskočily.

Zkontrolovat tři opakování za sebou, trajektorii míčku, ruku s raketou, geometrii sítě/kurtu a ořez na úzkém telefonu.
