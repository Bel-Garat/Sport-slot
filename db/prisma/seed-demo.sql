BEGIN;

UPDATE "venue"."venues"
SET "image_url" = '/images/community.webp'
WHERE "id" = '00000000-0000-4000-8000-000000000101' AND "image_url" IS NULL;

INSERT INTO "venue"."venues" ("id", "manager_id", "name", "address", "city", "description", "image_url")
VALUES
	('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'Tenisový klub Stromovka', 'U Studánky 3', 'Praha',
	 'Antukové kurty v klidné části u parku a jeden krytý kurt pro hru celoročně. Šatny, sprchy a půjčovna raket na recepci.', '/images/venues/tennis-clay.webp'),
	('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000001', 'Padel Arena Smíchov', 'Nádražní 52', 'Praha',
	 'Tři kryté padelové kurty s osvětlením pro turnajovou hru. Rakety a míčky k zapůjčení, kavárna s výhledem na kurty.', '/images/venues/padel.webp'),
	('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000001', 'Sportovní hala Lužánky', 'Lidická 12', 'Brno',
	 'Moderní hala s palubovkou pro basketbal, volejbal a florbal a menší sál pro futsal a házenou. Tribuna pro 300 diváků.', '/images/venues/basketball-hall.webp'),
	('00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000001', 'Badminton & Squash Královo Pole', 'Palackého 120', 'Brno',
	 'Čtyři badmintonové kurty se závodním povrchem a dva squashové kurty. Bistro, šatny a parkování přímo u haly.', '/images/venues/badminton-hall.webp'),
	('00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000001', 'Fotbalový areál Bory', 'Klatovská 200', 'Plzeň',
	 'Travnaté hřiště, umělá tráva třetí generace a menší hřiště pro malou kopanou a nohejbal. Všechna hřiště jsou osvětlená.', '/images/venues/football.webp'),
	('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000001', 'Beach Park Poruba', 'Opavská 61', 'Ostrava',
	 'Tři pískové kurty pro beach volejbal a nohejbal s osvětlením na večerní hru. Venkovní sprchy a bar.', '/images/venues/volleyball.webp'),
	('00000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000001', 'Sportcentrum Olomouc Dome', 'Hraniční 4', 'Olomouc',
	 'Nafukovací hala s dvěma tenisovými kurty a multifunkčním kurtem pro badminton a volejbal. Hraje se tu celý rok.', '/images/venues/sports-dome.webp'),
	('00000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000001', 'Tenis Club Liberec', 'Jablonecká 21', 'Liberec',
	 'Tři venkovní kurty s tvrdým povrchem pod Ještědem. Trenéři pro děti i dospělé, možnost permanentek.', '/images/venues/tennis-blue.webp'),
	('00000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000001', 'Městská sportovní hala Hradec Králové', 'Sportovní 15', 'Hradec Králové',
	 'Velká hala pro basketbal, házenou a futsal a tělocvična pro volejbal a badminton. Ideální pro týmové tréninky.', '/images/venues/sports-hall.webp')
ON CONFLICT DO NOTHING;

INSERT INTO "venue"."opening_hours" ("venue_id", "day_of_week", "open_time", "close_time")
SELECT hours.venue_id::uuid, day, hours.open_time, hours.close_time
FROM (
	VALUES
		('00000000-0000-4000-8000-000000000102', 1, 7, TIME '07:00', TIME '22:00'),
		('00000000-0000-4000-8000-000000000103', 1, 5, TIME '07:00', TIME '23:00'),
		('00000000-0000-4000-8000-000000000103', 6, 7, TIME '08:00', TIME '22:00'),
		('00000000-0000-4000-8000-000000000104', 1, 5, TIME '08:00', TIME '22:00'),
		('00000000-0000-4000-8000-000000000104', 6, 6, TIME '09:00', TIME '20:00'),
		('00000000-0000-4000-8000-000000000104', 7, 7, TIME '09:00', TIME '18:00'),
		('00000000-0000-4000-8000-000000000105', 1, 7, TIME '07:00', TIME '22:00'),
		('00000000-0000-4000-8000-000000000106', 1, 5, TIME '09:00', TIME '22:00'),
		('00000000-0000-4000-8000-000000000106', 6, 7, TIME '08:00', TIME '20:00'),
		('00000000-0000-4000-8000-000000000107', 1, 7, TIME '09:00', TIME '22:00'),
		('00000000-0000-4000-8000-000000000108', 1, 7, TIME '06:00', TIME '23:00'),
		('00000000-0000-4000-8000-000000000109', 1, 5, TIME '07:00', TIME '21:00'),
		('00000000-0000-4000-8000-000000000109', 6, 7, TIME '08:00', TIME '20:00'),
		('00000000-0000-4000-8000-000000000110', 1, 5, TIME '08:00', TIME '22:00'),
		('00000000-0000-4000-8000-000000000110', 6, 7, TIME '09:00', TIME '19:00')
) AS hours (venue_id, from_day, to_day, open_time, close_time)
CROSS JOIN LATERAL generate_series(hours.from_day, hours.to_day) AS day
ON CONFLICT DO NOTHING;

INSERT INTO "venue"."courts" ("id", "venue_id", "name", "sport", "surface", "indoor")
VALUES
	('00000000-0000-4000-8000-000000302001', '00000000-0000-4000-8000-000000000102', 'Kurt 1', 'tenis', 'Antuka', false),
	('00000000-0000-4000-8000-000000302002', '00000000-0000-4000-8000-000000000102', 'Kurt 2', 'tenis', 'Antuka', false),
	('00000000-0000-4000-8000-000000302003', '00000000-0000-4000-8000-000000000102', 'Kurt 3', 'tenis', 'Antuka', false),
	('00000000-0000-4000-8000-000000302004', '00000000-0000-4000-8000-000000000102', 'Krytý kurt', 'tenis', 'Koberec Supreme', true),
	('00000000-0000-4000-8000-000000303001', '00000000-0000-4000-8000-000000000103', 'Padel 1', 'padel', 'Umělá tráva s pískem', true),
	('00000000-0000-4000-8000-000000303002', '00000000-0000-4000-8000-000000000103', 'Padel 2', 'padel', 'Umělá tráva s pískem', true),
	('00000000-0000-4000-8000-000000303003', '00000000-0000-4000-8000-000000000103', 'Padel 3', 'padel', 'Umělá tráva s pískem', true),
	('00000000-0000-4000-8000-000000304001', '00000000-0000-4000-8000-000000000104', 'Hlavní hala', 'basketbal, volejbal, florbal', 'Palubovka', true),
	('00000000-0000-4000-8000-000000304002', '00000000-0000-4000-8000-000000000104', 'Malá hala', 'futsal, házená', 'Sportovní PVC', true),
	('00000000-0000-4000-8000-000000305001', '00000000-0000-4000-8000-000000000105', 'Badminton 1', 'badminton', 'Závodní koberec', true),
	('00000000-0000-4000-8000-000000305002', '00000000-0000-4000-8000-000000000105', 'Badminton 2', 'badminton', 'Závodní koberec', true),
	('00000000-0000-4000-8000-000000305003', '00000000-0000-4000-8000-000000000105', 'Badminton 3', 'badminton', 'Závodní koberec', true),
	('00000000-0000-4000-8000-000000305004', '00000000-0000-4000-8000-000000000105', 'Squash 1', 'squash', 'Dřevěná podlaha', true),
	('00000000-0000-4000-8000-000000305005', '00000000-0000-4000-8000-000000000105', 'Squash 2', 'squash', 'Dřevěná podlaha', true),
	('00000000-0000-4000-8000-000000306001', '00000000-0000-4000-8000-000000000106', 'Hlavní hřiště', 'fotbal', 'Přírodní tráva', false),
	('00000000-0000-4000-8000-000000306002', '00000000-0000-4000-8000-000000000106', 'Umělka', 'fotbal', 'Umělá tráva 3G', false),
	('00000000-0000-4000-8000-000000306003', '00000000-0000-4000-8000-000000000106', 'Malé hřiště', 'fotbal, nohejbal', 'Umělý trávník', false),
	('00000000-0000-4000-8000-000000307001', '00000000-0000-4000-8000-000000000107', 'Beach 1', 'beach volejbal, nohejbal', 'Písek', false),
	('00000000-0000-4000-8000-000000307002', '00000000-0000-4000-8000-000000000107', 'Beach 2', 'beach volejbal, nohejbal', 'Písek', false),
	('00000000-0000-4000-8000-000000307003', '00000000-0000-4000-8000-000000000107', 'Beach 3', 'beach volejbal', 'Písek', false),
	('00000000-0000-4000-8000-000000308001', '00000000-0000-4000-8000-000000000108', 'Tenis 1', 'tenis', 'Umělá tráva', true),
	('00000000-0000-4000-8000-000000308002', '00000000-0000-4000-8000-000000000108', 'Tenis 2', 'tenis', 'Umělá tráva', true),
	('00000000-0000-4000-8000-000000308003', '00000000-0000-4000-8000-000000000108', 'Multifunkční kurt', 'badminton, volejbal', 'Sportovní koberec', true),
	('00000000-0000-4000-8000-000000309001', '00000000-0000-4000-8000-000000000109', 'Kurt A', 'tenis', 'Tvrdý povrch', false),
	('00000000-0000-4000-8000-000000309002', '00000000-0000-4000-8000-000000000109', 'Kurt B', 'tenis', 'Tvrdý povrch', false),
	('00000000-0000-4000-8000-000000309003', '00000000-0000-4000-8000-000000000109', 'Kurt C', 'tenis', 'Tvrdý povrch', false),
	('00000000-0000-4000-8000-000000310001', '00000000-0000-4000-8000-000000000110', 'Velká hala', 'basketbal, házená, futsal', 'Palubovka', true),
	('00000000-0000-4000-8000-000000310002', '00000000-0000-4000-8000-000000000110', 'Tělocvična', 'volejbal, badminton', 'Sportovní PVC', true)
ON CONFLICT DO NOTHING;

INSERT INTO "venue"."price_rules" ("court_id", "day_of_week", "start_time", "end_time", "price_per_hour")
SELECT court.id, hours.day_of_week, slot.start_time, slot.end_time, slot.price
FROM "venue"."courts" AS court
JOIN (
	VALUES
		('00000000-0000-4000-8000-000000000102', 250.00, 380.00, 350.00),
		('00000000-0000-4000-8000-000000000103', 600.00, 900.00, 800.00),
		('00000000-0000-4000-8000-000000000104', 900.00, 1300.00, 1100.00),
		('00000000-0000-4000-8000-000000000105', 220.00, 320.00, 300.00),
		('00000000-0000-4000-8000-000000000106', 1200.00, 1800.00, 1500.00),
		('00000000-0000-4000-8000-000000000107', 300.00, 450.00, 400.00),
		('00000000-0000-4000-8000-000000000108', 450.00, 650.00, 600.00),
		('00000000-0000-4000-8000-000000000109', 200.00, 300.00, 280.00),
		('00000000-0000-4000-8000-000000000110', 800.00, 1100.00, 950.00)
) AS tariff (venue_id, base_price, peak_price, weekend_price) ON tariff.venue_id::uuid = court.venue_id
JOIN "venue"."opening_hours" AS hours ON hours.venue_id = court.venue_id
CROSS JOIN LATERAL (
	SELECT hours.open_time AS start_time, TIME '16:00' AS end_time, tariff.base_price AS price
	WHERE hours.day_of_week <= 5
	UNION ALL
	SELECT TIME '16:00', hours.close_time, tariff.peak_price
	WHERE hours.day_of_week <= 5
	UNION ALL
	SELECT hours.open_time, hours.close_time, tariff.weekend_price
	WHERE hours.day_of_week >= 6
) AS slot
WHERE NOT EXISTS (
	SELECT 1 FROM "venue"."price_rules" AS existing WHERE existing.court_id = court.id
);

COMMIT;
