-- Orders v2 Tier 0 migration

-- Modify orders table
ALTER TABLE "orders"
  ALTER COLUMN "status" SET DEFAULT 'ACTIVE',
  ALTER COLUMN "payment_status" SET DEFAULT 'PENDING',
  ALTER COLUMN "fulfillment_status" SET DEFAULT 'UNFULFILLED',
  ADD COLUMN IF NOT EXISTS "payment_event_at"           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "version"                    INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "source"                     TEXT NOT NULL DEFAULT 'storefront',
  ADD COLUMN IF NOT EXISTS "stripe_payment_intent_id"   TEXT,
  ADD COLUMN IF NOT EXISTS "stripe_session_id"          TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "orders_stripe_payment_intent_id_key"
  ON "orders"("stripe_payment_intent_id");

-- Modify order_items table
ALTER TABLE "order_items"
  ADD COLUMN IF NOT EXISTS "product_snapshot" JSONB;

-- Create inventory_reservations table
CREATE TABLE IF NOT EXISTS "inventory_reservations" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id"     UUID NOT NULL,
  "variant_id"   UUID,
  "quantity"     INT NOT NULL,
  "expires_at"   TIMESTAMPTZ NOT NULL,
  "confirmed_at" TIMESTAMPTZ,
  "released_at"  TIMESTAMPTZ,
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "inventory_reservations_order_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "inventory_reservations_order_id_key"
  ON "inventory_reservations"("order_id");

CREATE INDEX IF NOT EXISTS "inventory_reservations_variant_id_expires_at_idx"
  ON "inventory_reservations"("variant_id", "expires_at");

-- Create processed_webhooks table
CREATE TABLE IF NOT EXISTS "processed_webhooks" (
  "stripe_event_id" TEXT PRIMARY KEY,
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order_events table
CREATE TABLE IF NOT EXISTS "order_events" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id"    UUID NOT NULL,
  "event_type"  TEXT NOT NULL,
  "from_state"  TEXT,
  "to_state"    TEXT,
  "actor_type"  TEXT NOT NULL,
  "actor_id"    TEXT,
  "metadata"    JSONB NOT NULL DEFAULT '{}',
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "order_events_order_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "order_events_order_id_created_at_idx"
  ON "order_events"("order_id", "created_at" DESC);
