/*
  Warnings:

  - You are about to drop the `entitlements` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "entitlements" DROP CONSTRAINT "entitlements_purchase_id_fkey";

-- DropForeignKey
ALTER TABLE "entitlements" DROP CONSTRAINT "entitlements_stripe_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "entitlements" DROP CONSTRAINT "entitlements_subscription_id_fkey";

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "plan_id" TEXT;

-- DropTable
DROP TABLE "entitlements";

-- DropEnum
DROP TYPE "EntitlementSource";
