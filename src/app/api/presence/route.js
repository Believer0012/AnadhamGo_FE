import { getAllCamps } from '@/lib/campsData';
import { getClientIp } from '@/lib/authConfig';

/**
 * Server-Sent Events (SSE) & Presence Tracking Endpoint
 * Protected against Memory DoS, Unbounded Sets, and Socket Leaks.
 *
 * GET /api/presence?campId=pkg-kolukkumalai
 */

// Bounded in-memory ephemeral viewer tracker
const MAX_VIEWERS_PER_CAMP = 50;
const MAX_CONCURRENT_PER_IP = 2;
const STREAM_TIMEOUT_MS = 20000; // Auto-close stream after 20s to prevent serverless function concurrency exhaustion

const activeViewers = new Map(); // campId -> Set(sessionId)
const ipConnectionCount = new Map(); // ip -> count

export async function GET(request) {
    const ip = getClientIp(request);

    // 1. Enforce Per-IP Connection Cap
    const currentIpConns = ipConnectionCount.get(ip) || 0;
    if (currentIpConns >= MAX_CONCURRENT_PER_IP) {
        return new Response('Too many open presence streams from your IP', { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const rawCampId = (searchParams.get('campId') || 'general').trim().toLowerCase();

    // 2. Strict Whitelist Validation of campId
    const validCamps = new Set(['general', ...getAllCamps().map(c => c.id.toLowerCase())]);
    if (!validCamps.has(rawCampId)) {
        return new Response('Invalid campsite identifier', { status: 400 });
    }

    const campId = rawCampId;
    const sessionId = `${ip}_${Math.random().toString(36).substring(7)}`;

    // Track IP connection
    ipConnectionCount.set(ip, currentIpConns + 1);

    // Track active session (bounded)
    if (!activeViewers.has(campId)) {
        activeViewers.set(campId, new Set());
    }
    const sessionSet = activeViewers.get(campId);
    if (sessionSet.size < MAX_VIEWERS_PER_CAMP) {
        sessionSet.add(sessionId);
    }

    const encoder = new TextEncoder();
    let timeoutTimer = null;
    let heartbeatInterval = null;

    const cleanup = () => {
        if (timeoutTimer) clearTimeout(timeoutTimer);
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        
        sessionSet.delete(sessionId);
        if (sessionSet.size === 0) activeViewers.delete(campId);

        const activeIpConns = ipConnectionCount.get(ip) || 1;
        if (activeIpConns <= 1) {
            ipConnectionCount.delete(ip);
        } else {
            ipConnectionCount.set(ip, activeIpConns - 1);
        }
    };

    const stream = new ReadableStream({
        start(controller) {
            // Initial data
            const initialData = JSON.stringify({
                type: 'PRESENCE_UPDATE',
                campId,
                viewersCount: Math.max(1, sessionSet.size),
                message: sessionSet.size > 1 ? `${sessionSet.size} other explorers exploring these dates` : 'Available'
            });
            controller.enqueue(encoder.encode(`data: ${initialData}\n\n`));

            // Heartbeat every 15s
            heartbeatInterval = setInterval(() => {
                try {
                    const ping = JSON.stringify({
                        type: 'HEARTBEAT',
                        viewersCount: sessionSet.size,
                        timestamp: Date.now()
                    });
                    controller.enqueue(encoder.encode(`data: ${ping}\n\n`));
                } catch (e) {
                    cleanup();
                }
            }, 15000);

            // Auto-close after 60s timeout
            timeoutTimer = setTimeout(() => {
                cleanup();
                try { controller.close(); } catch (e) {}
            }, STREAM_TIMEOUT_MS);

            // Client disconnect event
            request.signal.addEventListener('abort', () => {
                cleanup();
                try { controller.close(); } catch (e) {}
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive'
        }
    });
}
