-- SportSlot: seed data Sportcentra podle Business Requests → Context.
-- Spouští jen jeden člověk (Alexandr) na sdílenou DB, ručně: npm run seed --workspace @sportslot/db
-- Idempotentní: existující řádky přeskočí (ON CONFLICT DO NOTHING), nic nepřepisuje ani nemaže.
-- Pevná ID, aby je šlo použít v testech a mockách (viz db/README.md, kap. 7).

BEGIN;

-- Správce Sportcentra. Google ID a e-mail jsou zástupné; skutečné přihlášení Samira založí jiný účet.
INSERT INTO "app_auth"."users" ("id", "google_id", "email", "name", "roles")
VALUES (
	'00000000-0000-4000-8000-000000000001',
	'seed-samir-obeidat',
	'samir.obeidat@sportslot.test',
	'Samir Obeidat',
	ARRAY['PLAYER', 'MANAGER']::"app_auth"."Role"[]
)
ON CONFLICT DO NOTHING;

-- Adresa v Contextu chybí; "Sportovní 1" je zástupná. Před prvním spuštěním na sdílené DB ji případně změňte.
INSERT INTO "venue"."venues" ("id", "manager_id", "name", "address", "city", "description")
VALUES (
	'00000000-0000-4000-8000-000000000101',
	'00000000-0000-4000-8000-000000000001',
	'Sportcentrum',
	'Sportovní 1',
	'Praha',
	'Venkovní areál se čtyřmi hřišti. Všechna hřiště mají umělé osvětlení, k dispozici jsou šatny se sprchami.'
)
ON CONFLICT DO NOTHING;

-- Otevřeno denně Po–Ne (1–7) 7:00–22:00
INSERT INTO "venue"."opening_hours" ("venue_id", "day_of_week", "open_time", "close_time")
SELECT '00000000-0000-4000-8000-000000000101', day, TIME '07:00', TIME '22:00'
FROM generate_series(1, 7) AS day
ON CONFLICT DO NOTHING;

-- Hřiště 2 má v Contextu tři sporty, sloupec sport je ale jeden text: ukládáme je oddělené čárkou.
INSERT INTO "venue"."courts" ("id", "venue_id", "name", "sport", "surface", "indoor")
VALUES
	('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', 'Hřiště 1', 'fotbal', 'Odpružený umělý trávník 3. generace (40 × 20 m)', false),
	('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000101', 'Hřiště 2', 'tenis, nohejbal, streetbal', 'Odpružený akrylátový povrch', false),
	('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000101', 'Hřiště 3', 'volejbal', 'Odpružený akrylátový povrch', false),
	('00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000101', 'Hřiště 4', 'basketbal', 'Beton', false)
ON CONFLICT DO NOTHING;

-- Ceník Po–Ne: 7:00–16:00 a 16:00–22:00. Opakované spuštění zastaví exclusion constraint price_rules_no_overlap.
INSERT INTO "venue"."price_rules" ("court_id", "day_of_week", "start_time", "end_time", "price_per_hour")
SELECT rule.court_id::uuid, day, rule.start_time, rule.end_time, rule.price
FROM (
	VALUES
		('00000000-0000-4000-8000-000000000201', TIME '07:00', TIME '16:00', 300.00),
		('00000000-0000-4000-8000-000000000201', TIME '16:00', TIME '22:00', 500.00),
		('00000000-0000-4000-8000-000000000202', TIME '07:00', TIME '16:00', 100.00),
		('00000000-0000-4000-8000-000000000202', TIME '16:00', TIME '22:00', 200.00),
		('00000000-0000-4000-8000-000000000203', TIME '07:00', TIME '16:00', 200.00),
		('00000000-0000-4000-8000-000000000203', TIME '16:00', TIME '22:00', 400.00),
		('00000000-0000-4000-8000-000000000204', TIME '07:00', TIME '16:00', 200.00),
		('00000000-0000-4000-8000-000000000204', TIME '16:00', TIME '22:00', 400.00)
) AS rule (court_id, start_time, end_time, price)
CROSS JOIN generate_series(1, 7) AS day
ON CONFLICT DO NOTHING;

COMMIT;
