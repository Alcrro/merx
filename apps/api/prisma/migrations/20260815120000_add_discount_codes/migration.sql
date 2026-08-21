-- CreateTable
CREATE TABLE "discount_codes" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "min_order_amount" DECIMAL(10,2),
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_reservations" (
    "id" TEXT NOT NULL,
    "discount_code_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "stripe_session_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'reserved',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "discount_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processed_stripe_events" (
    "event_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_stripe_events_pkey" PRIMARY KEY ("event_id")
);

-- AlterTable
ALTER TABLE "orders"
    ADD COLUMN "discount_code_id" TEXT,
    ADD COLUMN "discount_code_snapshot" TEXT;

-- CreateIndex
CREATE INDEX "discount_codes_store_id_deleted_at_idx" ON "discount_codes"("store_id", "deleted_at");

-- CreateIndex
CREATE INDEX "discount_reservations_status_created_at_idx" ON "discount_reservations"("status", "created_at");

-- CreateIndex (unique stripe_session_id — Prisma @unique)
CREATE UNIQUE INDEX "discount_reservations_stripe_session_id_key" ON "discount_reservations"("stripe_session_id");

-- AddForeignKey
ALTER TABLE "discount_codes" ADD CONSTRAINT "discount_codes_store_id_fkey"
    FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_reservations" ADD CONSTRAINT "discount_reservations_discount_code_id_fkey"
    FOREIGN KEY ("discount_code_id") REFERENCES "discount_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_discount_code_id_fkey"
    FOREIGN KEY ("discount_code_id") REFERENCES "discount_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Manual: index unic parțial — unicitate doar printre codurile neșterse
-- Permite recrearea unui cod după soft delete
CREATE UNIQUE INDEX "discount_codes_store_code_active_key"
    ON "discount_codes" ("store_id", "code")
    WHERE "deleted_at" IS NULL;

-- Manual: invariant de domeniu pe value
-- percentage: 0 < value <= 100 (stocat ca procent real: 10.00 = 10%)
-- fixed: value > 0
ALTER TABLE "discount_codes" ADD CONSTRAINT "discount_value_range" CHECK (
    ("type" = 'percentage' AND "value" > 0 AND "value" <= 100) OR
    ("type" = 'fixed'      AND "value" > 0)
);

-- Manual: usedCount nu poate deveni negativ la eliberări
ALTER TABLE "discount_codes" ADD CONSTRAINT "used_count_non_negative" CHECK ("used_count" >= 0);
