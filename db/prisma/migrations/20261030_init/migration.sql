-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "app_auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "audit";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "reservation";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "review";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "venue";

-- CreateEnum
CREATE TYPE "app_auth"."Role" AS ENUM ('PLAYER', 'MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "app_auth"."ManagerRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "reservation"."ReservationStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- CreateTable
CREATE TABLE "app_auth"."users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "google_id" TEXT NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "roles" "app_auth"."Role"[] DEFAULT ARRAY['PLAYER']::"app_auth"."Role"[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_auth"."manager_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "message" TEXT,
    "status" "app_auth"."ManagerRequestStatus" NOT NULL DEFAULT 'PENDING',
    "decided_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at" TIMESTAMPTZ(6),

    CONSTRAINT "manager_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue"."venues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "manager_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(200) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "description" VARCHAR(2000),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue"."opening_hours" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "venue_id" UUID NOT NULL,
    "day_of_week" SMALLINT NOT NULL,
    "open_time" TIME(6) NOT NULL,
    "close_time" TIME(6) NOT NULL,

    CONSTRAINT "opening_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue"."courts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "venue_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "sport" VARCHAR(50) NOT NULL,
    "surface" VARCHAR(100) NOT NULL,
    "indoor" BOOLEAN NOT NULL,

    CONSTRAINT "courts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue"."price_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "court_id" UUID NOT NULL,
    "day_of_week" SMALLINT NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "price_per_hour" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "price_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation"."reservations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "court_id" UUID NOT NULL,
    "venue_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "player_name" VARCHAR(150) NOT NULL,
    "start_at" TIMESTAMPTZ(6) NOT NULL,
    "end_at" TIMESTAMPTZ(6) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "status" "reservation"."ReservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelled_at" TIMESTAMPTZ(6),

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review"."reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reservation_id" UUID NOT NULL,
    "venue_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" VARCHAR(2000),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit"."audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "app_auth"."users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "venues_name_address_city_key" ON "venue"."venues"("name", "address", "city");

-- CreateIndex
CREATE UNIQUE INDEX "opening_hours_venue_id_day_of_week_key" ON "venue"."opening_hours"("venue_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "courts_venue_id_name_key" ON "venue"."courts"("venue_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_reservation_id_key" ON "review"."reviews"("reservation_id");

-- AddForeignKey
ALTER TABLE "app_auth"."manager_requests" ADD CONSTRAINT "manager_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_auth"."manager_requests" ADD CONSTRAINT "manager_requests_decided_by_id_fkey" FOREIGN KEY ("decided_by_id") REFERENCES "app_auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue"."opening_hours" ADD CONSTRAINT "opening_hours_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venue"."venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue"."courts" ADD CONSTRAINT "courts_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venue"."venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue"."price_rules" ADD CONSTRAINT "price_rules_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "venue"."courts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CheckConstraint
ALTER TABLE "review"."reviews"
ADD CONSTRAINT "reviews_rating_check"
CHECK ("rating" BETWEEN 1 AND 5);

-- CheckConstraint
ALTER TABLE "venue"."opening_hours"
ADD CONSTRAINT "opening_hours_day_of_week_check"
CHECK ("day_of_week" BETWEEN 1 AND 7);

-- CheckConstraint
ALTER TABLE "venue"."opening_hours"
ADD CONSTRAINT "opening_hours_time_check"
CHECK ("open_time" < "close_time");

-- CheckConstraint
ALTER TABLE "venue"."price_rules"
ADD CONSTRAINT "price_rules_day_of_week_check"
CHECK ("day_of_week" BETWEEN 1 AND 7);

-- CheckConstraint
ALTER TABLE "venue"."price_rules"
ADD CONSTRAINT "price_rules_time_check"
CHECK ("start_time" < "end_time");

-- CheckConstraint
ALTER TABLE "venue"."price_rules"
ADD CONSTRAINT "price_rules_price_check"
CHECK ("price_per_hour" >= 0);

-- Enable GiST support for UUID and numeric comparisons
CREATE SCHEMA IF NOT EXISTS "extensions";
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA "extensions";

SET search_path TO pg_catalog, extensions, public;

-- Prevent overlapping price intervals for the same court and weekday
ALTER TABLE "venue"."price_rules"
ADD CONSTRAINT "price_rules_no_overlap"
EXCLUDE USING gist (
    "court_id" WITH =,
    "day_of_week" WITH =,
    (
        tsrange(
            DATE '2000-01-01' + "start_time",
            DATE '2000-01-01' + "end_time",
            '[)'
        )
    ) WITH &&
);

-- CheckConstraint
ALTER TABLE "reservation"."reservations"
ADD CONSTRAINT "reservations_time_check"
CHECK ("start_at" < "end_at");

-- CheckConstraint
ALTER TABLE "reservation"."reservations"
ADD CONSTRAINT "reservations_price_check"
CHECK ("total_price" >= 0);

-- Prevent overlapping ACTIVE reservations for the same court
ALTER TABLE "reservation"."reservations"
ADD CONSTRAINT "reservations_no_active_overlap"
EXCLUDE USING gist (
    "court_id" WITH =,
    tstzrange("start_at", "end_at", '[)') WITH &&
)
WHERE ("status" = 'ACTIVE');

-- Allow only one pending manager request per user
CREATE UNIQUE INDEX "manager_requests_one_pending_per_user"
ON "app_auth"."manager_requests" ("user_id")
WHERE "status" = 'PENDING';

-- Require decision details for processed requests
ALTER TABLE "app_auth"."manager_requests"
ADD CONSTRAINT "manager_requests_decision_check"
CHECK (
    (
        "status" = 'PENDING'
        AND "decided_by_id" IS NULL
        AND "decided_at" IS NULL
    )
    OR
    (
        "status" IN ('APPROVED', 'REJECTED')
        AND "decided_by_id" IS NOT NULL
        AND "decided_at" IS NOT NULL
    )
);

-- Make email unique regardless of letter case
CREATE UNIQUE INDEX "users_email_lower_key"
ON "app_auth"."users" (LOWER("email"));

-- Require every user to have a roles value
ALTER TABLE "app_auth"."users"
ALTER COLUMN "roles" SET NOT NULL;

-- Every user must have the PLAYER role
ALTER TABLE "app_auth"."users"
ADD CONSTRAINT "users_must_have_player_role"
CHECK (
    "roles" @> ARRAY['PLAYER']::"app_auth"."Role"[]
);

-- Prevent modifications to existing audit logs
CREATE FUNCTION "audit"."prevent_audit_log_changes"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are append-only. Operation % is not allowed.', TG_OP;
END;
$$;

-- Block UPDATE, DELETE and TRUNCATE
CREATE TRIGGER "audit_logs_immutable"
BEFORE UPDATE OR DELETE OR TRUNCATE
ON "audit"."audit_logs"
FOR EACH STATEMENT
EXECUTE FUNCTION "audit"."prevent_audit_log_changes"();
