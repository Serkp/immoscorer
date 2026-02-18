"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSubscriptionStatus } from "@/lib/db";

interface SubData {
  id: string;
  status: string;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
}

let cachedResult: { isPro: boolean; subscription: SubData | null } | null = null;

export function useSubscription() {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(cachedResult?.isPro ?? false);
  const [loading, setLoading] = useState(!cachedResult);
  const [subscription, setSubscription] = useState<SubData | null>(
    cachedResult?.subscription ?? null
  );

  useEffect(() => {
    if (!user) {
      setIsPro(false);
      setLoading(false);
      setSubscription(null);
      return;
    }

    if (cachedResult) {
      setIsPro(cachedResult.isPro);
      setSubscription(cachedResult.subscription);
      setLoading(false);
      return;
    }

    async function check() {
      try {
        const sub = await getSubscriptionStatus(user!.id);
        const pro = !!sub;
        cachedResult = { isPro: pro, subscription: sub };
        setIsPro(pro);
        setSubscription(sub);
      } catch {
        setIsPro(false);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    }

    check();
  }, [user]);

  function refresh() {
    cachedResult = null;
    setLoading(true);
    if (user) {
      getSubscriptionStatus(user.id).then((sub) => {
        const pro = !!sub;
        cachedResult = { isPro: pro, subscription: sub };
        setIsPro(pro);
        setSubscription(sub);
        setLoading(false);
      }).catch(() => {
        setIsPro(false);
        setSubscription(null);
        setLoading(false);
      });
    }
  }

  return { isPro, loading, subscription, refresh };
}
