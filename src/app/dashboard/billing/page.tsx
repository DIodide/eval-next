import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isBillingEnabled } from "@/lib/billing-config";
import { getCustomerRecord } from "@/lib/server/stripe";
import { createCustomerPortalSession } from "@/lib/server/stripe-subscriptions";

export default async function BillingRedirectPage() {
  if (!isBillingEnabled()) {
    redirect("/dashboard");
  }

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const customer = await getCustomerRecord(userId);

  if (!customer) {
    redirect("/pricing");
  }

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const origin = `${protocol}://${host}`;

  const session = await createCustomerPortalSession(
    customer.stripe_customer_id,
    `${origin}/dashboard`,
  );

  redirect(session.url!);
}
