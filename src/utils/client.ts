import { Client } from "discord.js-selfbot-v13";
import { getCachedData, CacheKey } from "./cache";

let client: Client | null = null;

/**
 * Get or create a Discord client instance.
 * Ensures only one active client exists at a time.
 */
export async function getDiscordClient(): Promise<Client> {
    if (client && client.isReady()) {
        return client;
    }

    const token = await getCachedData<string>(CacheKey.Token);
    if (!token) {
        throw new Error("No token found. Please link your account first.");
    }

    // Clean up existing client if not ready
    if (client && !client.isReady()) {
        await destroyClient();
    }

    if (!client) {
        // Create client with memory optimization options
        const options: any = {
            checkUpdate: false,
            makeCache: (manager: any) => {
                // Limit cache sizes to prevent memory issues
                const limits: { [key: string]: number } = {
                    MessageManager: 50, // Only keep last 50 messages
                    ChannelManager: 50,
                    GuildMemberManager: 50,
                    GuildManager: 50,
                    UserManager: 100,
                    VoiceStateManager: 10,
                };

                const limit = limits[manager.constructor.name];
                if (limit) {
                    return manager.constructor.create({
                        maxSize: limit,
                    });
                }
                return new manager();
            },
        };
        client = new Client(options);
    }

    if (!client.isReady()) {
        await client.login(token);
    }

    return client;
}

/**
 * Destroy the Discord client and clean up resources.
 */
export async function destroyClient(): Promise<void> {
    if (client) {
        // Clean up caches before destroying
        client.ws.destroy();
        client.rest.clear();
        client.channels.cache.clear();
        client.guilds.cache.clear();
        client.users.cache.clear();

        client.destroy();
        client = null;

        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }
    }
}

/**
 * Validate a Discord token by attempting to login.
 * Creates a temporary client and cleans it up after validation.
 */
export async function validateToken(token: string): Promise<{ valid: boolean; user?: any; error?: string }> {
    let tempClient: Client | null = null;

    try {
        const options: any = {
            checkUpdate: false,
            makeCache: (manager: any) => {
                // Use minimal cache for validation only
                if (manager.constructor.name === "MessageManager" ||
                    manager.constructor.name === "ChannelManager" ||
                    manager.constructor.name === "GuildMemberManager") {
                    return manager.constructor.create({ maxSize: 0 });
                }
                return new manager();
            },
        };

        tempClient = new Client(options);
        await tempClient.login(token);

        // Get minimal user info
        const userInfo = {
            id: tempClient.user?.id,
            username: tempClient.user?.username,
            discriminator: tempClient.user?.discriminator,
            avatar: tempClient.user?.avatarURL(),
        };

        return { valid: true, user: userInfo };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    } finally {
        // Always clean up the temporary client
        if (tempClient) {
            tempClient.ws.destroy();
            tempClient.rest.clear();
            tempClient.destroy();
            tempClient = null;

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }
        }
    }
}

/**
 * Get client memory usage information.
 */
export function getClientMemoryInfo(): { clientExists: boolean; ready: boolean } {
    return {
        clientExists: client !== null,
        ready: client?.isReady() ?? false,
    };
}
