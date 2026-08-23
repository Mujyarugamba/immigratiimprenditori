"use client";

import { useEffect } from "react";

type PrivacyNavigator = Navigator & {
  globalPrivacyControl?: boolean;
};

type IdleWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions,
    ) => number;
    cancelIdleCallback?: (handle: number) => void;
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
    // Deploy/branch previews render production public data in read-only mode.
    // They must not generate analytics writes or QA traffic in live counters.
    if (process.env.NEXT_PUBLIC_PREVIEW_READ_ONLY === "true") return;
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

    const idleWindow = window as IdleWindow;
    if (typeof idleWindow.requestIdleCallback === "function") {
      const idleId = idleWindow.requestIdleCallback(send, { timeout: 2500 });
      return () => idleWindow.cancelIdleCallback?.(idleId);
    }

    const timeoutId = globalThis.setTimeout(send, 1500);
    return () => globalThis.clearTimeout(timeoutId);
  }, []);

  return null;
}
