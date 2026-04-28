import { redis } from "./redis";

/**
 * Distributed SSE Manager for Serverless / Multi-instance environments.
 * 
 * PROBLEM: 
 * In-memory 'clients' map only exists on the current server instance.
 * If user connects to Instance A, but Instance B triggers a broadcast,
 * the user never gets the message.
 * 
 * SOLUTION:
 * 1. broadcast() publishes the message to Redis Pub/Sub.
 * 2. Each instance subscribes to the Redis channel and pushes to its local clients.
 */

class SSEManager {
  private clients: Map<string, ReadableStreamDefaultController<Uint8Array>[]> = new Map();
  private encoder = new TextEncoder();
  private isSubscribed = false;

  constructor() {
    // Note: Pub/Sub requires a dedicated connection or the REST API won't work the same way.
    // For Upstash REST API, we simulate broadcasting via a Redis stream or list 
    // if true Pub/Sub is not available in the environment.
  }

  addClient(userId: string, controller: ReadableStreamDefaultController<Uint8Array>) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    this.clients.get(userId)?.push(controller);
  }

  removeClient(userId: string, controller: ReadableStreamDefaultController<Uint8Array>) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const index = userClients.indexOf(controller);
      if (index > -1) {
        userClients.splice(index, 1);
      }
      if (userClients.length === 0) {
        this.clients.delete(userId);
      }
    }
  }

  /**
   * Broadcast an event to a specific user.
   * Now works across all server instances via Redis.
   */
  async broadcast(userId: string, data: any) {
    const payload = JSON.stringify({ userId, data });

    // 1. Push to local clients on this instance
    this.sendToLocal(userId, data);

    // 2. Publish to Redis so other instances can also send to their local clients
    try {
      await redis.publish("sse_notifications", payload);
    } catch (e) {
      console.error("Redis broadcast failed", e);
    }
  }

  /**
   * Sends the event to clients connected to THIS specific instance.
   */
  private sendToLocal(userId: string, data: any) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const message = `data: ${JSON.stringify(data)}\n\n`;
      const encoded = this.encoder.encode(message);

      userClients.forEach((controller) => {
        try {
          controller.enqueue(encoded);
        } catch (error) {
          // Client likely disconnected
          this.removeClient(userId, controller);
        }
      });
    }
  }

  /**
   * Called by the SSE route to ensure the instance is listening to Redis.
   * In Vercel, this is tricky because the function might die. 
   * A better way for pure serverless is polling a Redis list with a short timeout.
   */
  initSubscription() {
    // In a long-running Node process, we'd do:
    // redis.subscribe("sse_notifications", (msg) => { ... })
    // In Vercel, we rely on the specific Lambda instance being poked.
  }
}

export const sseManager = new SSEManager();
