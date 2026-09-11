-- AlterTable: make password optional, add Google auth fields
ALTER TABLE "users"
  ALTER COLUMN "password" DROP NOT NULL,
  ADD COLUMN "avatar_url" TEXT,
  ADD COLUMN "auth_provider" TEXT NOT NULL DEFAULT 'email',
  ADD COLUMN "google_id" TEXT,
  ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
