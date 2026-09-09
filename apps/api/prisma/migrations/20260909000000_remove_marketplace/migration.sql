-- DropForeignKey
ALTER TABLE "marketplace_listings" DROP CONSTRAINT "marketplace_listings_store_id_fkey";

-- DropForeignKey
ALTER TABLE "marketplace_listings" DROP CONSTRAINT "marketplace_listings_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "marketplace_matches" DROP CONSTRAINT "marketplace_matches_seller_id_fkey";

-- DropForeignKey
ALTER TABLE "marketplace_transactions" DROP CONSTRAINT "marketplace_transactions_match_id_fkey";

-- DropIndex
DROP INDEX "stores_stripe_connected_account_id_key";

-- AlterTable
ALTER TABLE "stores" DROP COLUMN "listing_count_month",
DROP COLUMN "stripe_connected_account_id",
DROP COLUMN "stripe_connected_account_status";

-- DropTable
DROP TABLE "marketplace_listings";

-- DropTable
DROP TABLE "marketplace_matches";

-- DropTable
DROP TABLE "marketplace_transactions";
