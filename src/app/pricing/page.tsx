"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRICING_PLANS } from "@/lib/pricing-config";
import { api } from "@/trpc/react";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  GraduationCap,
  Loader2,
  Target,
  Trophy,
  User,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PricingPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get user type from Clerk metadata to determine default tab
  const userType = user?.publicMetadata?.userType as
    | "player"
    | "coach"
    | "league"
    | undefined;
  const [requestDemoOpen, setRequestDemoOpen] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<
    "player" | "coach" | null
  >(null);
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"players" | "coaches" | "leagues">(
    "players",
  );
  const [paymentStatusDialog, setPaymentStatusDialog] = useState<{
    open: boolean;
    type: "success" | "failed" | "canceled" | null;
    planName?: string;
    message?: string;
  }>({
    open: false,
    type: null,
  });

  // Fetch customer data if user is logged in
  const { data: customerData, isLoading: isLoadingCustomer } =
    api.payments.getCustomer.useQuery(undefined, {
      enabled: !!user,
    });

  // Create subscription checkout mutation
  const createSubscriptionCheckout =
    api.payments.createSubscriptionCheckout.useMutation({
      onSuccess: (data) => {
        if (data.url) {
          window.location.href = data.url;
        }
      },
      onError: (error) => {
        setPaymentStatusDialog({
          open: true,
          type: "failed",
          message: error.message,
        });
        setLoadingCheckout(null);
      },
    });

  // Create customer portal session mutation
  const createPortalSession = api.payments.createPortalSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error("Failed to open customer portal", {
        description: error.message,
      });
    },
  });

  const handleScheduleDemo = () => {
    window.open("https://calendly.com/evalgaming/eval-demo", "_blank");
    setRequestDemoOpen(false);
  };

  const handleUserTypeSelect = (userType: "player" | "coach") => {
    setSelectedUserType(userType);
  };

  const handleSignUp = () => {
    if (selectedUserType) {
      setShowSignUpModal(false);
      // Reset selection after a brief delay to allow modal to close
      setTimeout(() => setSelectedUserType(null), 300);
    }
  };

  const resetAndCloseModal = () => {
    setSelectedUserType(null);
    setShowSignUpModal(false);
  };

  const handlePlayerCTA = () => {
    if (user) {
      router.push("/dashboard/player");
    } else {
      setShowSignUpModal(true);
    }
  };

  const handleCoachCTA = () => {
    if (user) {
      router.push("/dashboard/coaches");
    } else {
      setShowSignUpModal(true);
    }
  };

  const handleSubscribe = async (planId: "gold" | "platinum") => {
    if (!user) {
      setShowSignUpModal(true);
      return;
    }

    const plan =
      PRICING_PLANS.COACHES[planId.toUpperCase() as "GOLD" | "PLATINUM"];

    if (!plan.priceId) {
      setPaymentStatusDialog({
        open: true,
        type: "failed",
        message:
          "Pricing not configured. Please contact support to set up this plan.",
      });
      return;
    }

    setLoadingCheckout(planId);

    try {
      const baseUrl = window.location.origin;
      const result = await createSubscriptionCheckout.mutateAsync({
        priceId: plan.priceId,
        successUrl: `${baseUrl}/pricing?success=true&plan=${planId}`,
        cancelUrl: `${baseUrl}/pricing?canceled=true`,
        metadata: {
          plan_id: planId,
          plan_name: plan.name,
        },
      });

      // If subscription was updated (not new checkout), redirect to success
      if (result.updated && result.url) {
        window.location.href = result.url;
        return;
      }

      // Otherwise, redirect to Stripe checkout
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      // Error handled in mutation onError
      console.error("Checkout error:", error);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    try {
      const baseUrl = window.location.origin;
      await createPortalSession.mutateAsync({
        returnUrl: `${baseUrl}/pricing`,
      });
    } catch (error) {
      // Error handled in mutation onError
      console.error("Portal error:", error);
    }
  };

  // Get current subscription plan
  const currentSubscription = customerData?.subscriptions.find(
    (sub) => sub.status === "ACTIVE" || sub.status === "TRIALING",
  );

  // Determine which plan the user currently has based on price ID
  const getCurrentPlan = () => {
    if (!currentSubscription?.stripePriceId) return null;

    const goldPriceId = PRICING_PLANS.COACHES.GOLD.priceId;
    const platinumPriceId = PRICING_PLANS.COACHES.PLATINUM.priceId;

    if (currentSubscription.stripePriceId === goldPriceId) {
      return "gold";
    }
    if (currentSubscription.stripePriceId === platinumPriceId) {
      return "platinum";
    }
    return null;
  };

  const currentPlan = getCurrentPlan();

  // Handle success/cancel redirects
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const plan = searchParams.get("plan");

    if (success === "true") {
      const planName =
        plan === "gold"
          ? "EVAL Gold"
          : plan === "platinum"
            ? "EVAL Platinum"
            : "Premium";
      setPaymentStatusDialog({
        open: true,
        type: "success",
        planName,
      });
      // Clean up URL
      router.replace("/pricing", { scroll: false });
    }

    if (canceled === "true") {
      setPaymentStatusDialog({
        open: true,
        type: "canceled",
      });
      // Clean up URL
      router.replace("/pricing", { scroll: false });
    }
  }, [searchParams, router]);

  // Update active tab when userType becomes available
  useEffect(() => {
    if (userType === "coach") {
      setActiveTab("coaches");
    } else if (userType === "league") {
      setActiveTab("leagues");
    } else if (userType === "player") {
      setActiveTab("players");
    }
  }, [userType]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-orange-500/30">
      {/* Enhanced Background with Floating Elements */}
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="absolute top-20 left-10 h-32 w-32 animate-pulse rounded-full bg-cyan-500/20 blur-xl"></div>
      <div className="absolute top-40 right-20 h-24 w-24 animate-pulse rounded-full bg-purple-500/20 blur-lg delay-1000"></div>
      <div className="absolute bottom-40 left-1/4 h-40 w-40 animate-pulse rounded-full bg-orange-500/20 blur-xl delay-2000"></div>
      <div className="absolute right-1/3 bottom-20 h-28 w-28 animate-pulse rounded-full bg-cyan-500/20 blur-lg delay-3000"></div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Compact Header */}
        <div className="mb-12 text-center">
          <h1 className="font-orbitron cyber-text glow-text mb-4 text-3xl font-black text-white md:text-6xl">
            PRICING PLANS
          </h1>

          {/* Compact Rainbow Divider */}
          <div className="mb-6 flex items-center justify-center">
            <div className="to-eval-cyan h-0.5 w-12 bg-gradient-to-r from-transparent"></div>
            <div className="from-eval-cyan to-eval-purple h-0.5 w-8 bg-gradient-to-r"></div>
            <div className="from-eval-purple to-eval-orange h-0.5 w-8 bg-gradient-to-r"></div>
            <div className="from-eval-orange h-0.5 w-12 bg-gradient-to-r to-transparent"></div>
          </div>

          <p className="font-rajdhani mx-auto mb-6 max-w-2xl text-lg text-gray-300">
            Choose the perfect plan to elevate your esports journey
          </p>

          {/* Subscription Status Banner */}
          {user && currentSubscription && (
            <div className="mx-auto mb-6 max-w-2xl rounded-lg border border-green-400/30 bg-gradient-to-r from-green-600/20 to-green-400/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-orbitron text-sm font-bold text-green-400">
                      ACTIVE SUBSCRIPTION
                    </p>
                    <p className="font-rajdhani text-xs text-gray-300">
                      Until{" "}
                      {new Date(
                        currentSubscription.currentPeriodEnd,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleManageSubscription}
                  variant="outline"
                  size="sm"
                  className="border-green-400/50 text-green-400 hover:bg-green-400/10"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              onClick={() => setRequestDemoOpen(true)}
              className="font-orbitron transform bg-gradient-to-r from-purple-600 to-cyan-400 px-6 py-2 font-bold tracking-wider text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:to-cyan-500"
            >
              REQUEST A DEMO
            </Button>
          </div>
        </div>

        {/* Enhanced Pricing Tabs */}
        <div className="glass-morphism rounded-2xl border-white/20 p-6 md:p-8">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "players" | "coaches" | "leagues")
            }
            className="mx-auto w-full max-w-6xl"
          >
            <TabsList className="mx-auto mb-8 w-full max-w-sm rounded-full bg-black/40 py-5">
              <TabsTrigger
                value="players"
                className="font-orbitron rounded-full px-3 py-4 text-sm text-white transition-all duration-300 data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
              >
                PLAYERS
              </TabsTrigger>
              <TabsTrigger
                value="coaches"
                className="font-orbitron rounded-full px-3 py-4 text-sm text-white transition-all duration-300 data-[state=active]:bg-orange-400 data-[state=active]:text-black"
              >
                COACHES
              </TabsTrigger>
              <TabsTrigger
                value="leagues"
                className="font-orbitron rounded-full px-3 py-4 text-sm text-white transition-all duration-300 data-[state=active]:bg-purple-400 data-[state=active]:text-black"
              >
                LEAGUES
              </TabsTrigger>
            </TabsList>

            {/* Players Pricing */}
            <TabsContent value="players" className="mt-8">
              <div className="mx-auto grid max-w-md grid-cols-1 gap-8 md:grid-cols-1">
                {/* Free Tier */}
                <Card className="glass-morphism transform border-white/20 transition-all duration-300 hover:scale-105 hover:border-cyan-400/30 hover:shadow-xl hover:shadow-cyan-400/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="font-orbitron text-2xl text-white">
                      Free
                    </CardTitle>
                    <CardDescription className="font-rajdhani text-gray-400">
                      Get started with basic features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="mb-4">
                      <p className="font-orbitron mb-2 text-4xl text-white">
                        $0
                      </p>
                      <p className="font-rajdhani text-gray-400">
                        Forever free for players and students
                      </p>
                    </div>
                    <ul className="font-rajdhani space-y-3">
                      <li className="flex items-start">
                        <Check className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-cyan-400" />
                        <span className="text-gray-300">
                          Basic player profile
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-cyan-400" />
                        <span className="text-gray-300">
                          View public tryouts
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-cyan-400" />
                        <span className="text-gray-300">
                          Upload 1 gameplay clip
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-cyan-400" />
                        <span className="text-gray-300">
                          Send up to 3 coach messages
                        </span>
                      </li>
                      <li className="flex items-start">
                        <X className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-gray-500" />
                        <span className="text-gray-500">
                          Advanced analytics
                        </span>
                      </li>
                      <li className="flex items-start">
                        <X className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-gray-500" />
                        <span className="text-gray-500">
                          Priority visibility to coaches
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handlePlayerCTA}
                      className="font-orbitron w-full transform bg-gradient-to-r from-cyan-500 to-cyan-600 text-white transition-all duration-300 hover:scale-105 hover:from-cyan-600 hover:to-cyan-700"
                    >
                      GET STARTED
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            {/* Coaches Pricing */}
            <TabsContent value="coaches" className="mt-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Free Tier */}
                <Card className="glass-morphism transform border-white/20 transition-all duration-300 hover:scale-105 hover:border-gray-400/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="font-orbitron text-2xl text-white">
                      Free
                    </CardTitle>
                    <CardDescription className="font-rajdhani text-gray-400">
                      Basic scouting tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="mb-4">
                      <p className="font-orbitron mb-2 text-4xl text-white line-through decoration-red-500">
                        $0
                      </p>
                      <p className="font-rajdhani text-gray-400">Free pilot</p>
                    </div>
                    <ul className="font-rajdhani space-y-3">
                      <li className="flex items-start">
                        <Check className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-green-400" />
                        <span className="text-gray-300">
                          Basic coach profile
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-green-400" />
                        <span className="text-gray-300">
                          Browse player profiles
                        </span>
                      </li>
                      <li className="flex items-start">
                        <X className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-gray-500" />
                        <span className="text-gray-500">
                          Contact players in curated e-sports recruiting
                          database
                        </span>
                      </li>
                      <li className="flex items-start">
                        <X className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-gray-500" />
                        <span className="text-gray-500">
                          Advanced player search
                        </span>
                      </li>
                      <li className="flex items-start">
                        <X className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-gray-500" />
                        <span className="text-gray-500">Create tryouts</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleCoachCTA}
                      className="font-orbitron w-full transform bg-gradient-to-r from-gray-600 to-gray-700 text-white transition-all duration-300 hover:scale-105 hover:from-gray-700 hover:to-gray-800"
                    >
                      GET STARTED
                    </Button>
                  </CardFooter>
                </Card>

                {/* EVAL Gold Tier */}
                <Card className="glass-morphism relative transform border-orange-400/50 shadow-lg shadow-orange-400/10 transition-all duration-300 hover:scale-105 hover:border-orange-400">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                    <Badge className="font-orbitron bg-gradient-to-r from-orange-400 to-orange-500 px-4 py-1 text-black">
                      POPULAR
                    </Badge>
                  </div>
                  <CardHeader className="pt-6 pb-4">
                    <CardTitle className="font-orbitron text-2xl text-white">
                      EVAL Gold
                    </CardTitle>
                    <CardDescription className="font-rajdhani text-gray-400">
                      Enhanced recruiting tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="mb-4">
                      <p className="font-orbitron mb-2 text-4xl text-white line-through decoration-red-500">
                        $0
                      </p>
                      <p className="font-rajdhani text-gray-400">per year</p>
                    </div>
                    <ul className="font-rajdhani space-y-3">
                      <li className="flex items-start">
                        <Check className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-orange-400" />
                        <span className="text-gray-300">
                          Enhanced school profile
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-orange-400" />
                        <span className="text-gray-300">
                          Advanced player search filters
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-orange-400" />
                        <span className="text-gray-300">
                          Contact up to 100 players per month
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-orange-400" />
                        <span className="text-gray-300">
                          Scout at EVAL Combines
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-orange-400" />
                        <span className="text-gray-300">
                          Basic analytics dashboard
                        </span>
                      </li>
                      <li className="flex items-start">
                        <X className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-gray-500" />
                        <span className="text-gray-500">
                          Talent pipeline management
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {currentPlan === "gold" ? (
                      <Button
                        onClick={handleManageSubscription}
                        variant="outline"
                        className="font-orbitron w-full border-orange-400/50 text-orange-400 transition-all duration-300 hover:bg-orange-400/10"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        MANAGE SUBSCRIPTION
                      </Button>
                    ) : currentPlan === "platinum" ? (
                      <Button
                        onClick={() => handleSubscribe("gold")}
                        disabled={loadingCheckout !== null}
                        variant="outline"
                        className="font-orbitron w-full border-orange-400/50 text-orange-400 transition-all duration-300 hover:bg-orange-400/10 disabled:opacity-50"
                      >
                        {loadingCheckout === "gold" ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            PROCESSING...
                          </>
                        ) : (
                          "DOWNGRADE TO GOLD"
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSubscribe("gold")}
                        disabled={loadingCheckout !== null}
                        className="font-orbitron w-full transform bg-gradient-to-r from-orange-400 to-orange-500 text-black transition-all duration-300 hover:scale-105 hover:from-orange-500 hover:to-orange-600 disabled:opacity-50"
                      >
                        {loadingCheckout === "gold" ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            PROCESSING...
                          </>
                        ) : (
                          "UPGRADE NOW"
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>

                {/* EVAL Platinum Tier */}
                <Card className="glass-morphism relative transform border-purple-400/50 shadow-lg shadow-purple-400/10 transition-all duration-300 hover:scale-105 hover:border-purple-400">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                    <Badge className="font-orbitron bg-gradient-to-r from-purple-400 to-purple-500 px-4 py-1 text-black">
                      PREMIUM
                    </Badge>
                  </div>
                  <CardHeader className="pt-6 pb-4">
                    <CardTitle className="font-orbitron text-2xl text-white">
                      EVAL Platinum
                    </CardTitle>
                    <CardDescription className="font-rajdhani text-gray-400">
                      Complete recruiting solution
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="mb-4">
                      <p className="font-orbitron mb-2 text-4xl text-white line-through decoration-red-500">
                        $0
                      </p>
                      <p className="font-rajdhani text-gray-400">per year</p>
                    </div>
                    <ul className="font-rajdhani space-y-3">
                      <li className="flex items-start">
                        <Check className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-purple-400" />
                        <span className="text-gray-300">
                          Premium verified coach profile
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-purple-400" />
                        <span className="text-gray-300">
                          Recruitment consulting
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-purple-400" />
                        <span className="text-gray-300">
                          Unlimited player contacts
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-purple-400" />
                        <span className="text-gray-300">
                          Unlimited tryout creation
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-purple-400" />
                        <span className="text-gray-300">
                          Advanced analytics and reporting
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-purple-400" />
                        <span className="text-gray-300">
                          Talent pipeline management
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Check className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-purple-400" />
                        <span className="text-gray-300">Priority support</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {currentPlan === "platinum" ? (
                      <Button
                        onClick={handleManageSubscription}
                        variant="outline"
                        className="font-orbitron w-full border-purple-400/50 text-purple-400 transition-all duration-300 hover:bg-purple-400/10"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        MANAGE SUBSCRIPTION
                      </Button>
                    ) : currentPlan === "gold" ? (
                      <Button
                        onClick={() => handleSubscribe("platinum")}
                        disabled={loadingCheckout !== null}
                        className="font-orbitron w-full transform bg-gradient-to-r from-purple-400 to-purple-500 text-black transition-all duration-300 hover:scale-105 hover:from-purple-500 hover:to-purple-600 disabled:opacity-50"
                      >
                        {loadingCheckout === "platinum" ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            PROCESSING...
                          </>
                        ) : (
                          "UPGRADE TO PLATINUM"
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSubscribe("platinum")}
                        disabled={loadingCheckout !== null}
                        className="font-orbitron w-full transform bg-gradient-to-r from-purple-400 to-purple-500 text-black transition-all duration-300 hover:scale-105 hover:from-purple-500 hover:to-purple-600 disabled:opacity-50"
                      >
                        {loadingCheckout === "platinum" ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            PROCESSING...
                          </>
                        ) : (
                          "GO PREMIUM"
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            {/* Leagues Pricing */}
            <TabsContent value="leagues" className="mt-8">
              <div className="glass-morphism mx-auto max-w-4xl rounded-xl border-white/20 p-8 text-center transition-all duration-300 hover:border-purple-400/30 md:p-12">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <h2 className="font-orbitron mb-4 text-3xl text-white">
                  Custom League Solutions
                </h2>
                <p className="font-rajdhani mx-auto mb-8 max-w-2xl text-lg text-gray-300">
                  We offer tailored solutions for leagues of all sizes. Our team
                  will work with you to create a custom package that meets your
                  specific needs and budget.
                </p>
                <div className="mx-auto mb-8 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="glass-morphism transform rounded-lg border-white/20 p-6 transition-all duration-300 hover:scale-105 hover:border-cyan-400/30">
                    <Trophy className="mx-auto mb-3 h-8 w-8 text-cyan-400" />
                    <h3 className="font-orbitron mb-2 text-white">
                      Tournament Management
                    </h3>
                    <p className="font-rajdhani text-sm text-gray-300">
                      Complete tools for organizing and running tournaments
                    </p>
                  </div>
                  <div className="glass-morphism transform rounded-lg border-white/20 p-6 transition-all duration-300 hover:scale-105 hover:border-purple-400/30">
                    <Users className="mx-auto mb-3 h-8 w-8 text-purple-400" />
                    <h3 className="font-orbitron mb-2 text-white">
                      Player Database
                    </h3>
                    <p className="font-rajdhani text-sm text-gray-300">
                      Comprehensive database of all registered players
                    </p>
                  </div>
                  <div className="glass-morphism transform rounded-lg border-white/20 p-6 transition-all duration-300 hover:scale-105 hover:border-orange-400/30">
                    <BarChart3 className="mx-auto mb-3 h-8 w-8 text-orange-400" />
                    <h3 className="font-orbitron mb-2 text-white">
                      Broadcasting Tools
                    </h3>
                    <p className="font-rajdhani text-sm text-gray-300">
                      Integration with streaming platforms and overlays
                    </p>
                  </div>
                </div>
                <Link href="/about/contact">
                  <Button className="font-orbitron transform bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-3 font-bold tracking-wider text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:to-pink-600">
                    CONTACT SALES
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Enhanced FAQ Section */}
        <div className="mx-auto mt-24 max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="font-orbitron mb-4 text-3xl text-white">
              Frequently Asked Questions
            </h2>
            <div className="mx-auto h-1 w-32 bg-gradient-to-r from-transparent via-cyan-400 via-orange-400 via-purple-400 to-transparent"></div>
          </div>

          <div className="space-y-6">
            <div className="glass-morphism rounded-lg border-white/20 p-6 transition-all duration-300 hover:border-cyan-400/30">
              <h3 className="font-orbitron mb-3 flex items-center text-xl text-white">
                <div className="mr-3 h-2 w-2 rounded-full bg-cyan-400"></div>
                Can I change plans at any time?
              </h3>
              <p className="font-rajdhani pl-5 text-gray-300">
                Yes, you can upgrade, downgrade, or cancel your subscription at
                any time. Changes will take effect at the start of your next
                billing cycle.
              </p>
            </div>

            <div className="glass-morphism rounded-lg border-white/20 p-6 transition-all duration-300 hover:border-purple-400/30">
              <h3 className="font-orbitron mb-3 flex items-center text-xl text-white">
                <div className="mr-3 h-2 w-2 rounded-full bg-purple-400"></div>
                Does EVAL offer monthly plans?
              </h3>
              <p className="font-rajdhani pl-5 text-gray-300">
                To accomodate for the esports recruiting cycle, EVAL only offers
                annual plans. However, if you have specific needs, contact us at
                support@evalgaming.com.
              </p>
            </div>

            <div className="glass-morphism rounded-lg border-white/20 p-6 transition-all duration-300 hover:border-orange-400/30">
              <h3 className="font-orbitron mb-3 flex items-center text-xl text-white">
                <div className="mr-3 h-2 w-2 rounded-full bg-orange-400"></div>
                Do you offer student discounts?
              </h3>
              <p className="font-rajdhani pl-5 text-gray-300">
                Yes, we offer a 20% discount for verified students. Contact our
                support team with your student ID to apply for the discount.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Request Modal */}
      <Dialog open={requestDemoOpen} onOpenChange={setRequestDemoOpen}>
        <DialogContent className="glass-morphism max-h-[90vh] overflow-y-auto border-white/20 text-white sm:max-w-4xl">
          <DialogHeader className="relative">
            <DialogTitle className="font-orbitron mb-4 text-2xl font-bold text-white">
              DISCOVER THE FUTURE OF COLLEGIATE ESPORTS RECRUITING
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Intro Section */}
            <div className="rounded-lg border border-purple-400/30 bg-gradient-to-r from-purple-600/20 to-cyan-400/20 p-6">
              <div className="mb-4 flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-cyan-400">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-orbitron text-xl font-bold text-white">
                    EVAL - Princeton-Backed Startup
                  </h2>
                  <p className="font-rajdhani text-sm text-slate-300">
                    The best recruiting platform offering analytics built
                    specifically for collegiate esports programs
                  </p>
                </div>
              </div>
              <p className="font-rajdhani leading-relaxed text-slate-300">
                After successfully powering the Spring 2025 Garden State Esports
                (GSE) Valorant season with rankings, MVP recognition, and a full
                recruiting dashboard, EVAL is now excited to invite you to
                participate in our 2025 Summer Collegiate pilot.
              </p>
            </div>

            {/* Features Grid */}
            <div>
              <h3 className="font-orbitron mb-4 text-xl font-bold text-white">
                Why coaches are choosing EVAL:
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Recruiting Dashboard */}
                <div className="glass-morphism transform rounded-lg border-white/20 p-4 transition-all hover:scale-105 hover:border-cyan-400/50">
                  <div className="mb-3 flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20">
                      <Users className="h-5 w-5 text-cyan-400" />
                    </div>
                    <h4 className="font-orbitron font-bold text-white">
                      Recruiting Dashboard
                    </h4>
                  </div>
                  <p className="font-rajdhani text-sm text-slate-300">
                    Browse ranked players across VALORANT, Rocket League,
                    Overwatch, and Smash Ultimate. Bookmark top prospects and
                    manage your recruiting pipeline—all in one platform.
                  </p>
                </div>

                {/* EVAL Rankings */}
                <div className="glass-morphism transform rounded-lg border-white/20 p-4 transition-all hover:scale-105 hover:border-orange-400/50">
                  <div className="mb-3 flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                      <Trophy className="h-5 w-5 text-orange-400" />
                    </div>
                    <h4 className="font-orbitron font-bold text-white">
                      EVAL Rankings
                    </h4>
                  </div>
                  <p className="font-rajdhani text-sm text-slate-300">
                    Weekly player rankings, preseason projections, and
                    season-long awards like Match MVP, Most Improved, and Most
                    Clutch to give you a clear view of the most impactful
                    players.
                  </p>
                </div>

                {/* EVAL Analytics */}
                <div className="glass-morphism transform rounded-lg border-white/20 p-4 transition-all hover:scale-105 hover:border-purple-400/50">
                  <div className="mb-3 flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                      <BarChart3 className="h-5 w-5 text-purple-400" />
                    </div>
                    <h4 className="font-orbitron font-bold text-white">
                      EVAL Analytics
                    </h4>
                  </div>
                  <p className="font-rajdhani text-sm text-slate-300">
                    Our proprietary Composite Score blends verified in-game
                    stats with league data to create a single, trusted
                    performance metric for evaluating player consistency and
                    potential.
                  </p>
                </div>

                {/* Tryouts Platform */}
                <div className="glass-morphism transform rounded-lg border-white/20 p-4 transition-all hover:scale-105 hover:border-green-400/50">
                  <div className="mb-3 flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                      <Target className="h-5 w-5 text-green-400" />
                    </div>
                    <h4 className="font-orbitron font-bold text-white">
                      Tryouts Platform
                    </h4>
                  </div>
                  <p className="font-rajdhani text-sm text-slate-300">
                    Post and manage tryouts to discover top talent nationwide.
                    Tryouts can be hosted for free or used to raise funds for
                    your program or scholarships.
                  </p>
                </div>

                {/* Academic Profiles */}
                <div className="glass-morphism transform rounded-lg border-white/20 p-4 transition-all hover:scale-105 hover:border-blue-400/50 md:col-span-2">
                  <div className="mb-3 flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                      <GraduationCap className="h-5 w-5 text-blue-400" />
                    </div>
                    <h4 className="font-orbitron font-bold text-white">
                      Academic & Extracurricular Profiles
                    </h4>
                  </div>
                  <p className="font-rajdhani text-sm text-slate-300">
                    View player GPAs, academic interests, and extracurricular
                    involvement to evaluate holistic fit for your program. EVAL
                    is free for students to sign up, helping your program reach
                    a wider talent pool while supporting equitable access to
                    recruitment.
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="rounded-lg border border-cyan-400/30 bg-gradient-to-r from-purple-600/10 to-cyan-400/10 p-12 text-center">
              <div className="flex flex-col items-center justify-center gap-8">
                <Button
                  onClick={handleScheduleDemo}
                  className="font-orbitron flex transform items-center space-x-5 bg-gradient-to-r from-purple-600 to-cyan-400 px-20 py-8 text-3xl font-bold tracking-wider text-white shadow-xl shadow-purple-500/30 transition-all duration-200 hover:scale-105 hover:from-purple-700 hover:to-cyan-500"
                >
                  <Calendar className="h-10 w-10" />
                  <span>SCHEDULE A DEMO</span>
                </Button>
                <div className="font-rajdhani text-sm text-slate-400">
                  or email{" "}
                  <a
                    href="mailto:support@evalgaming.com"
                    className="text-cyan-400 transition-colors hover:text-cyan-300"
                  >
                    support@evalgaming.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sign Up Modal */}
      <Dialog open={showSignUpModal} onOpenChange={resetAndCloseModal}>
        <DialogContent className="glass-morphism border-white/20 text-white sm:max-w-lg">
          <DialogHeader className="relative">
            <DialogTitle className="mb-4 text-2xl font-bold text-white">
              SIGN UP
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-xl font-bold text-white">
                CHOOSE YOUR ACCOUNT TYPE
              </h2>
              <p className="text-sm text-slate-300">
                Empowering students and college coaches to connect.
              </p>
            </div>

            {/* Horizontal Options */}
            <div className="grid grid-cols-2 gap-4">
              {/* Player Option */}
              <button
                onClick={() => handleUserTypeSelect("player")}
                className={`rounded-lg border-2 p-6 text-center transition-all ${
                  selectedUserType === "player"
                    ? "border-blue-400 bg-blue-900/50 shadow-lg shadow-blue-500/20"
                    : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                      selectedUserType === "player"
                        ? "border-blue-400 bg-blue-500/20"
                        : "border-slate-500 bg-slate-700/50"
                    }`}
                  >
                    <User
                      className={`h-6 w-6 ${
                        selectedUserType === "player"
                          ? "text-blue-400"
                          : "text-slate-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="mb-2 font-bold text-white">PLAYER</h3>
                    <p className="text-xs leading-relaxed text-slate-300">
                      I am a player looking to find an esports scholarship and
                      related opportunities.
                    </p>
                  </div>
                </div>
              </button>

              {/* College Option */}
              <button
                onClick={() => handleUserTypeSelect("coach")}
                className={`rounded-lg border-2 p-6 text-center transition-all ${
                  selectedUserType === "coach"
                    ? "border-blue-400 bg-blue-900/50 shadow-lg shadow-blue-500/20"
                    : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                      selectedUserType === "coach"
                        ? "border-blue-400 bg-blue-500/20"
                        : "border-slate-500 bg-slate-700/50"
                    }`}
                  >
                    <GraduationCap
                      className={`h-6 w-6 ${
                        selectedUserType === "coach"
                          ? "text-blue-400"
                          : "text-slate-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="mb-2 font-bold text-white">SCHOOL</h3>
                    <p className="text-xs leading-relaxed text-slate-300">
                      I am a coach, director or administrator looking to make
                      finding players easier.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Sign Up Button */}
            {selectedUserType ? (
              <SignUpButton
                mode="modal"
                unsafeMetadata={{ userType: selectedUserType }}
              >
                <Button
                  onClick={handleSignUp}
                  className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white shadow-lg hover:bg-blue-700"
                >
                  SIGN UP AS{" "}
                  {selectedUserType === "coach"
                    ? "SCHOOL"
                    : selectedUserType.toUpperCase()}
                </Button>
              </SignUpButton>
            ) : (
              <Button
                disabled
                className="w-full cursor-not-allowed rounded-lg bg-slate-700 py-3 font-medium text-slate-500"
              >
                SIGN UP
              </Button>
            )}

            {/* Sign In Link */}
            <div className="text-center">
              <SignInButton mode="modal">
                <button
                  onClick={resetAndCloseModal}
                  className="text-sm text-blue-400 transition-colors hover:text-blue-300"
                >
                  Already have an account? Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Status Dialog */}
      <Dialog
        open={paymentStatusDialog.open}
        onOpenChange={(open) =>
          setPaymentStatusDialog({ ...paymentStatusDialog, open })
        }
      >
        <DialogContent className="glass-morphism max-w-md border-white/20 text-white sm:max-w-md">
          {paymentStatusDialog.type === "success" && (
            <>
              <DialogHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-green-400/20">
                  <CheckCircle2 className="h-10 w-10 text-green-400" />
                </div>
                <DialogTitle className="font-orbitron text-2xl font-bold text-white">
                  SUBSCRIPTION ACTIVATED!
                </DialogTitle>
                <DialogDescription className="font-rajdhani text-base text-gray-300">
                  Welcome to {paymentStatusDialog.planName ?? "Premium"}!
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="rounded-lg border border-green-400/30 bg-gradient-to-r from-green-600/10 to-green-400/10 p-4">
                  <div className="flex items-start space-x-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                    <div className="flex-1">
                      <p className="font-rajdhani text-sm font-semibold text-white">
                        Your subscription is now active
                      </p>
                      <p className="font-rajdhani mt-1 text-xs text-gray-300">
                        You now have access to all premium features. Your
                        billing cycle will renew automatically.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-rajdhani text-sm font-semibold text-white">
                    What's next?
                  </p>
                  <ul className="font-rajdhani space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <ArrowRight className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-400" />
                      <span>
                        Access your dashboard to explore premium features
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-400" />
                      <span>
                        Start recruiting with advanced search and analytics
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-400" />
                      <span>
                        Manage your subscription anytime from your account
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => {
                    setPaymentStatusDialog({ open: false, type: null });
                    router.push("/dashboard/coaches");
                  }}
                  className="font-orbitron w-full bg-gradient-to-r from-green-500 to-green-600 text-white transition-all hover:from-green-600 hover:to-green-700 sm:w-auto"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    setPaymentStatusDialog({ open: false, type: null });
                  }}
                  variant="outline"
                  className="font-rajdhani w-full border-gray-600 text-gray-300 hover:bg-gray-800 sm:w-auto"
                >
                  Stay on Pricing
                </Button>
              </DialogFooter>
            </>
          )}

          {paymentStatusDialog.type === "failed" && (
            <>
              <DialogHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-red-400/20">
                  <XCircle className="h-10 w-10 text-red-400" />
                </div>
                <DialogTitle className="font-orbitron text-2xl font-bold text-white">
                  PAYMENT FAILED
                </DialogTitle>
                <DialogDescription className="font-rajdhani text-base text-gray-300">
                  We couldn't process your payment
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="rounded-lg border border-red-400/30 bg-gradient-to-r from-red-600/10 to-red-400/10 p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                    <div className="flex-1">
                      <p className="font-rajdhani text-sm font-semibold text-white">
                        {paymentStatusDialog.message ??
                          "There was an issue processing your payment"}
                      </p>
                      <p className="font-rajdhani mt-1 text-xs text-gray-300">
                        Please check your payment method and try again, or
                        contact support if the problem persists.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-rajdhani text-sm font-semibold text-white">
                    Common issues:
                  </p>
                  <ul className="font-rajdhani space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <X className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-red-400" />
                      <span>Insufficient funds or card declined</span>
                    </li>
                    <li className="flex items-start">
                      <X className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-red-400" />
                      <span>Expired or invalid payment method</span>
                    </li>
                    <li className="flex items-start">
                      <X className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-red-400" />
                      <span>Network or processing error</span>
                    </li>
                  </ul>
                </div>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => {
                    setPaymentStatusDialog({ open: false, type: null });
                    // Retry checkout - user can click the button again
                  }}
                  className="font-orbitron w-full bg-gradient-to-r from-orange-400 to-orange-500 text-black transition-all hover:from-orange-500 hover:to-orange-600 sm:w-auto"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => {
                    window.open("mailto:support@evalgaming.com", "_blank");
                  }}
                  variant="outline"
                  className="font-rajdhani w-full border-gray-600 text-gray-300 hover:bg-gray-800 sm:w-auto"
                >
                  Contact Support
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    setPaymentStatusDialog({ open: false, type: null });
                  }}
                  variant="ghost"
                  className="font-rajdhani w-full text-gray-400 hover:text-gray-300 sm:w-auto"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}

          {paymentStatusDialog.type === "canceled" && (
            <>
              <DialogHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-400/20">
                  <AlertCircle className="h-10 w-10 text-yellow-400" />
                </div>
                <DialogTitle className="font-orbitron text-2xl font-bold text-white">
                  CHECKOUT CANCELED
                </DialogTitle>
                <DialogDescription className="font-rajdhani text-base text-gray-300">
                  No charges were made to your account
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="rounded-lg border border-yellow-400/30 bg-gradient-to-r from-yellow-600/10 to-yellow-400/10 p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
                    <div className="flex-1">
                      <p className="font-rajdhani text-sm font-semibold text-white">
                        Your checkout was canceled
                      </p>
                      <p className="font-rajdhani mt-1 text-xs text-gray-300">
                        You can return to complete your subscription anytime. No
                        payment was processed.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-rajdhani text-sm font-semibold text-white">
                    Ready to upgrade?
                  </p>
                  <ul className="font-rajdhani space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <Check className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-yellow-400" />
                      <span>All plans include a full feature set</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-yellow-400" />
                      <span>Cancel anytime with no long-term commitment</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-yellow-400" />
                      <span>Secure payment processing via Stripe</span>
                    </li>
                  </ul>
                </div>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => {
                    setPaymentStatusDialog({ open: false, type: null });
                    // Scroll to pricing plans
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="font-orbitron w-full bg-gradient-to-r from-orange-400 to-orange-500 text-black transition-all hover:from-orange-500 hover:to-orange-600 sm:w-auto"
                >
                  View Plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    setPaymentStatusDialog({ open: false, type: null });
                  }}
                  variant="outline"
                  className="font-rajdhani w-full border-gray-600 text-gray-300 hover:bg-gray-800 sm:w-auto"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
