"use client";

import React, { useState, useEffect } from "react";
import { QrCode, RefreshCw, ExternalLink } from "lucide-react";

const PMS_STAFF_URL =
  process.env.NEXT_PUBLIC_PMS_URL
    ? `${process.env.NEXT_PUBLIC_PMS_URL.replace(/\/$/, "")}/staff`
    : "https://aanandham-pms.onrender.com/staff";

export default function StaffTerminalPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);

  // Auto-dismiss loading indicator after fallback timeout if onLoad fires slowly
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [iframeKey]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#0B150E",
        overflow: "hidden",
        zIndex: 99999,
        fontFamily:
          "var(--font-jakarta), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0B150E",
            zIndex: 10,
            transition: "opacity 0.3s ease",
            color: "#F8F9F5",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              border: "3px solid rgba(213, 237, 85, 0.18)",
              borderTopColor: "#D5ED55",
              animation: "spin 0.9s linear infinite",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                fontSize: "13px",
                fontWeight: "700",
                color: "#D5ED55",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              <QrCode size={16} /> Camp Staff Terminal
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "#8E9E82" }}>
              Initializing camera scanner & operations...
            </p>
          </div>
        </div>
      )}

      {/* Error Fallback Banner */}
      {hasError && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            background: "rgba(30, 20, 20, 0.95)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "14px",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            color: "#FCA5A5",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          <span style={{ fontSize: "13px" }}>
            Terminal took longer than expected to connect.
          </span>
          <button
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
              setIframeKey((prev) => prev + 1);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "8px",
              background: "#D5ED55",
              color: "#0E1711",
              border: "none",
              fontWeight: "700",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={13} /> Retry
          </button>
          <a
            href={PMS_STAFF_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              color: "#D5ED55",
              fontSize: "12px",
              textDecoration: "underline",
            }}
          >
            Open Standalone <ExternalLink size={12} />
          </a>
        </div>
      )}

      {/* Embedded Fullscreen Staff Terminal */}
      <iframe
        key={iframeKey}
        src={PMS_STAFF_URL}
        title="Aanandham Camp Staff & Field Scanner Terminal"
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        allow="camera; microphone; clipboard-write; geolocation; fullscreen;"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
      />

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
