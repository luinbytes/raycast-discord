import { Client } from "discord.js-selfbot-v13";
import { getCachedData, CacheKey } from "./cache";

let client: Client | null = null;

export async function getDiscordClient(): Promise<Client> {
    if (client && client.isReady()) {
        return client;
    }

    const token = await getCachedData<string>(CacheKey.Token);
    if (!token) {
        throw new Error("No token found. Please link your account first.");
    }

    if (!client) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const options: any = {
            checkUpdate: false,
            // Memory-efficient cache settings to avoid OOM
            // Only cache essential data, sweep unused items
            restSweepInterval: 60, // Sweep REST cache every 60 seconds
            sweepers: {
                messages: {
                    interval: 300, // Sweep messages every 5 minutes
                    lifetime: 120, // Keep messages for 2 minutes max
                },
            },
            // Disable caching for large data structures we don't need
            makeCache: (manager: unknown) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const m = manager as any;
                // Disable message, reaction, and stage instance caching
                if (m.name === 'MessageManager' || m.name === 'ReactionManager' || m.name === 'StageInstanceManager') {
                    return m.constructor;
                }
                // Use default cache for other managers
                return undefined;
            },
            // Disable presence updates to reduce memory
            presence: {
                status: 'invisible',
            },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client = new Client(options) as any;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!client?.isReady()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (client as any).login(token);
    }

    return client!;
}

export async function destroyClient() {
    if (client) {
        client.destroy();
        client = null;
    }
}
