"use client";

import { useEffect } from "react";

type PrivacyNavigator = Navigator & {
  globalPrivacyControl?: boolean;
};

function analyticsAllowed() {
  const navigatorWithPrivacy = navigator as PrivacyNavigator;
  if (navigatorWithPrivacy.globalPrivacyControl === true) return false;
  if (navigator.doNotTrack === "1") return false;
  return true;
}

function platformLocale() {
  const lang = document.documentElement.lang.toLowerCase().split("-")[0];
  return ["it", "en", "fr", "es", "de", "ar", "zh"].includes(lang) ? lang : "it";
}

export function PrivacyFriendlyAnalytics() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_PRIVACY_ANALYTICS_ENABLED !== "true") return;
    if (!analyticsAllowed()) return;

    const send = () => {
      const body = JSON.stringify({
        path: window.location.pathname,
        locale: platformLocale(),
      });

      void fetch("/api/analytics/page-view", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        credentials: "omit",
        keepalive: true,
        cache: "no-store",
      }).catch(() => {
        // Analytics must never affect navigation or renderability.
      });
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(send, { timeout: 2500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(send, 1500);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return null;
}
