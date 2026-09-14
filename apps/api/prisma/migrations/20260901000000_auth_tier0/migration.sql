-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('active', 'suspended', 'blocked');

-- AlterTable users: add platform_role (expand)
ALTER TABLE "users" ADD COLUMN "platform_role" "PlatformRole";

-- Backfill platform_role from role
UPDATE "users" SET "platform_role" = CASE
  WHEN "role" = 'admin' THEN 'admin'::"PlatformRole"
  ELSE 'user'::"PlatformRole"
END;

-- Set NOT NULL and default after backfill (contract)
ALTER TABLE "users" ALTER COLUMN "platform_role" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "platform_role" SET DEFAULT 'user';

-- Drop old role column
ALTER TABLE "users" DROP COLUMN "role";

-- AlterTable stores: add status
ALTER TABLE "stores" ADD COLUMN "status" "StoreStatus" NOT NULL DEFAULT 'active';

-- CreateIndex stores status
CREATE INDEX "stores_status_idx" ON "stores"("status");
