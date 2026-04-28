import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sseManager } from "@/lib/sse";

/**
 * SSE Endpoint — Real-time notification stream
 *
 * Client connects once via EventSource; server pushes events as they happen.
 * No more polling! Events are pushed when:
 *   - A new notification is created (via lib/notifications.ts broadcast)
 *   - Workflow step changes (approval, revision, rejection)
 *
 * Keep-alive pings every 30s prevent proxy/load-balancer timeouts.
 */

// Force Node.js runtime — SSE requires long-lived connections
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = (session.user as any).id;
  const encoder = new TextEncoder();

  let savedController: ReadableStreamDefaultController<Uint8Array>;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      savedController = controller;

      // Register this connection
      sseManager.addClient(userId, controller);

      // Send initial event to confirm connection
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "connected", userId })}\n\n`
        )
      );

      // Keep-alive ping every 30s — prevents nginx/proxy from closing idle connections
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(keepAlive);
        }
      }, 30_000);

      // Clean up when client disconnects
      req.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        sseManager.removeClient(userId, controller);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
    cancel() {
      // Stream cancelled by client
      if (savedController) {
        sseManager.removeClient(userId, savedController);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx response buffering
    },
  });
}
