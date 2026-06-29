"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { isBillingEnabled } from "@/lib/billing-config";
import type { FeatureKey } from "@/lib/pricing-config";
import { UpgradeModal } from "./upgrade-modal";

export interface UpgradeModalContext {
  featureKey: FeatureKey;
  title?: string;
  description?: string;
}

interface UpgradeModalProviderState {
  open: boolean;
  context: UpgradeModalContext | null;
}

interface UpgradeModalContextValue {
  openUpgradeModal: (context: UpgradeModalContext) => void;
  closeUpgradeModal: () => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextValue | null>(null);

export function UpgradeModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<UpgradeModalProviderState>({
    open: false,
    context: null,
  });

  const openUpgradeModal = useCallback((context: UpgradeModalContext) => {
    if (!isBillingEnabled()) return;
    setState({ open: true, context });
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setState({ open: false, context: null });
  }, []);

  const value = useMemo(
    () => ({ openUpgradeModal, closeUpgradeModal }),
    [openUpgradeModal, closeUpgradeModal],
  );

  return (
    <UpgradeModalContext.Provider value={value}>
      {children}
      {isBillingEnabled() && (
        <UpgradeModal
          open={state.open}
          context={state.context}
          onOpenChange={(open) => {
            if (!open) closeUpgradeModal();
          }}
        />
      )}
    </UpgradeModalContext.Provider>
  );
}

export function useUpgradeModal() {
  const context = useContext(UpgradeModalContext);
  if (!context) {
    throw new Error("useUpgradeModal must be used within UpgradeModalProvider");
  }
  return context;
}
