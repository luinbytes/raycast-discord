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
        const options: any = { checkUpdate: false };
        client = new Client(options);
    }

    if (!client.isReady()) {
        await client.login(token);
    }

    return client;
}

export async function destroyClient() {
    if (client) {
        client.destroy();
        client = null;
    }
}
