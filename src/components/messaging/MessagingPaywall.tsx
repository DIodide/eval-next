"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LockIcon, CrownIcon } from "lucide-react";
import Link from "next/link";

export function MessagingPaywall() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <Card className="max-w-md border-yellow-500/30 bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-8 text-center shadow-2xl">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-yellow-500/50 bg-gray-800">
              <LockIcon className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>
        <h2 className="font-orbitron mb-3 text-2xl font-bold text-white">
          Upgrade to EVAL+
        </h2>
        <p className="font-rajdhani mb-6 text-gray-400">
          Direct messaging between players and coaches is available exclusively
          with an EVAL+ subscription. Unlock messaging, progress tracking, and
          your verification badge.
        </p>
        <div className="mb-4 flex items-center justify-center gap-2 text-yellow-300">
          <CrownIcon className="h-5 w-5" />
          <span className="font-orbitron text-lg font-bold">$5/month</span>
        </div>
        <Button
          asChild
          className="font-orbitron w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-lg hover:from-yellow-600 hover:to-amber-700"
        >
          <Link href="/pricing">Unlock EVAL+</Link>
        </Button>
      </Card>
    </div>
  );
}
