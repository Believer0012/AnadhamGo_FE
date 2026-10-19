import { NextResponse } from "next/server";

const PMS_URL =
  process.env.NEXT_PUBLIC_PMS_URL ||
  process.env.PMS_BASE_URL ||
  "https://aanandham-pms.onrender.com";

export async function POST(request) {
  try {
    const payload = await request.json().catch(() => ({}));

    // Forward to Central PMS backend (Server-to-Server, 100% bypasses browser CSP & ad-blockers)
    const targetUrl = `${PMS_URL.replace(/\/$/, "")}/api/analytics`;

    fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.error("PMS Analytics proxy forward error:", err?.message || err);
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "analytics-proxy-active" });
}
