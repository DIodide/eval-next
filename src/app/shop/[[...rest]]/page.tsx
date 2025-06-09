"use client"

import { useState } from "react"
import { UserProfile, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "Basic access to EVAL features",
    features: [
      "Access to public combines",
      "Basic player profile",
      "Community forums access",
      "Limited stats tracking",
    ],
    buttonText: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    description: "Enhanced features for serious players",
    features: [
      "All Free features",
      "Priority combine registration",
      "Advanced stats tracking",
      "Custom player card",
      "Direct messaging",
    ],
    buttonText: "Go Pro",
    popular: true,
  },
  {
    name: "Elite",
    price: "$19.99",
    description: "Ultimate package for aspiring pros",
    features: [
      "All Pro features",
      "1-on-1 coaching sessions",
      "Exclusive tournaments",
      "Team recruitment visibility",
      "Performance analytics",
      "Verified player badge",
    ],
    buttonText: "Go Elite",
    popular: false,
  },
]

function PricingTable() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
      {pricingPlans.map((plan) => (
        <Card
          key={plan.name}
          className={`relative ${
            plan.popular
              ? "border-cyan-400 bg-gray-800"
              : "border-gray-700 bg-gray-900"
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-cyan-400 text-black px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </span>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-white">
              {plan.name}
            </CardTitle>
            <div className="text-center">
              <span className="text-4xl font-bold text-white">{plan.price}</span>
              <span className="text-gray-400">/month</span>
            </div>
            <p className="text-center text-gray-400 mt-2">{plan.description}</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center text-gray-300">
                  <svg
                    className="w-5 h-5 text-cyan-400 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className={`w-full mt-6 ${
                plan.popular
                  ? "bg-cyan-400 hover:bg-cyan-500 text-black"
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
            >
              {plan.buttonText}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function UserProfileSection() {
  const { user } = useUser()

  return (
    <div className="max-w-4xl mx-auto mt-16 p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Your Profile</h2>
      <div className="bg-gray-900 p-4 rounded-lg">
        <UserProfile />
      </div>
    </div>
  )
}

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState<"pricing" | "profile">("pricing")

  return (
    <div className="min-h-screen bg-black py-16">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">EVAL Shop</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan to enhance your gaming journey and manage your
            profile settings.
          </p>
        </div>

        <div className="flex justify-center space-x-4 mb-12">
          <Button
            onClick={() => setActiveTab("pricing")}
            className={`${
              activeTab === "pricing"
                ? "bg-cyan-400 text-black"
                : "bg-gray-800 text-white"
            }`}
          >
            Pricing Plans
          </Button>
          <Button
            onClick={() => setActiveTab("profile")}
            className={`${
              activeTab === "profile"
                ? "bg-cyan-400 text-black"
                : "bg-gray-800 text-white"
            }`}
          >
            User Profile
          </Button>
        </div>

        {activeTab === "pricing" ? <PricingTable /> : <UserProfileSection />}
      </div>
    </div>
  )
}
