-- CreateEnum
CREATE TYPE "CoachStatus" AS ENUM ('SCRAPED', 'INVITED', 'ACTIVE');

-- CreateEnum
CREATE TYPE "CoachSource" AS ENUM ('SCRAPED', 'MANUAL', 'SIGNUP');

-- AlterTable
ALTER TABLE "coaches" ADD COLUMN     "forwarded_emails_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "intro_email_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" "CoachSource" NOT NULL DEFAULT 'SIGNUP',
ADD COLUMN     "status" "CoachStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "title" TEXT,
ALTER COLUMN "clerk_id" DROP NOT NULL,
ALTER COLUMN "username" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "coaches_status_idx" ON "coaches"("status");
