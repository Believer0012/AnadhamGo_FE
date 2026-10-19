"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const TENANT_ID =
  process.env.NEXT_PUBLIC_PMS_TENANT_ID || "t-aanandham-hq";

function getOrSetSessionId() {
  if (typeof window === "undefined") return "";
  try {
    let sId = sessionStorage.getItem("pms_vsid");
    if (!sId) {
      sId =
        "s_" +
        Math.random().toString(36).substring(2, 10) +
        Date.now().toString(36);
      sessionStorage.setItem("pms_vsid", sId);
    }
    return sId;
  } catch {
    return "s_anon_" + Date.now().toString(36);
  }
}

function detectChannel(searchParams) {
  if (typeof window === "undefined") return "direct";
  try {
    const utmSrc = (
      searchParams?.get("utm_source") ||
      searchParams?.get("source") ||
      ""
    ).toLowerCase();
    const utmMed = (searchParams?.get("utm_medium") || "").toLowerCase();
    const ref = (document.referrer || "").toLowerCase();

    if (
      utmSrc.includes("instagram") ||
      utmMed.includes("instagram") ||
      ref.includes("instagram.com")
    )
      return "instagram";
    if (
      utmSrc.includes("whatsapp") ||
      utmMed.includes("whatsapp") ||
      ref.includes("whatsapp.com") ||
      ref.includes("wa.me")
    )
      return "whatsapp";
    if (
      utmSrc.includes("google") ||
      utmMed.includes("cpc") ||
      ref.includes("google.") ||
      ref.includes("bing.") ||
      ref.includes("yahoo.")
    )
      return "google";
    return "direct";
  } catch {
    return "direct";
  }
}

function sendPing(eventType, path, searchParams, campOverride = null) {
  if (typeof window === "undefined") return;
  if (!path) return;
  if (path.startsWith("/admin") || path.startsWith("/api")) return;

  try {
    const sessionId = getOrSetSessionId();
    const channel = detectChannel(searchParams);
    const campMatch = path.match(/\/camps\/([^/?]+)/);
    const campId = campOverride || (campMatch ? campMatch[1] : "general");

    const payload = {
      tenantId: TENANT_ID,
      campId,
      eventType,
      sessionId,
      channel,
      path,
    };

    // Use same-origin proxy to guarantee 100% deliverability across all browsers & Incognito
    const localUrl = "/api/analytics";

    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      navigator.sendBeacon(localUrl, blob);
    } else {
      fetch(localUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Silently swallow analytics errors
  }
}

function PmsAnalyticsTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef("");

  useEffect(() => {
    if (!pathname) return;
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    // Step 1: Pageview
    sendPing("pageview", pathname, searchParams);

    // Step 2: Stays Viewed (Directory or individual camp)
    if (
      pathname.startsWith("/camps") ||
      pathname.startsWith("/stay") ||
      pathname.includes("/camps/")
    ) {
      sendPing("detail_view", pathname, searchParams);
    }

    if (pathname === "/book" || pathname.startsWith("/book/")) {
      sendPing("booking_start", pathname, searchParams);
      sendPing("checkout_init", pathname, searchParams);
    }
  }, [pathname, searchParams]);

  // Listen to in-modal events from BookingEngineModal
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleCustomTrack = (e) => {
      const { eventType, campId } = e.detail || {};
      if (eventType) {
        sendPing(eventType, pathname || "/", searchParams, campId);
      }
    };

    window.addEventListener("pms_track", handleCustomTrack);
    return () => window.removeEventListener("pms_track", handleCustomTrack);
  }, [pathname, searchParams]);

  // Live visitor heartbeat every 45s
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/api")) return;

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        sendPing("heartbeat", pathname, searchParams);
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [pathname, searchParams]);

  return null;
}

export default function PmsAnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <PmsAnalyticsTrackerInner />
    </Suspense>
  );
}
