import { Action, ActionPanel, List, Image, Icon, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import { getCachedData, setCachedData, CacheKey } from "./utils/cache";
import { getDiscordClient } from "./utils/client";
import DmChat from "./views/DmChat";

interface DMChannel {
    id: string;
    recipient: string;
    avatar: string | null;
    lastMessage?: {
        content: string;
        timestamp: string; // Store as string in cache, convert to Date on load
    };
}

export default function Command() {
    const [dms, setDms] = useState<DMChannel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { push } = useNavigation();

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const cachedDMs = await getCachedData<DMChannel[]>(CacheKey.DMs);
        if (cachedDMs) {
            // Sort by timestamp desc
            const sorted = cachedDMs.sort((a, b) => {
                const tA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
                const tB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
                return tB - tA;
            });
            setDms(sorted);
            setIsLoading(false);
        }

        try {
            const client = await getDiscordClient();

            // Fetch DMs
            const channels = client.channels.cache
                .filter((c: any) => c.type === "DM")
                .map((c: any) => ({
                    id: c.id,
                    recipient: c.recipient.username,
                    avatar: c.recipient.displayAvatarURL({ format: "png" }),
                    lastMessage: c.lastMessage ? {
                        content: c.lastMessage.content,
                        timestamp: c.lastMessage.createdAt.toISOString()
                    } : undefined
                }));

            const sorted = channels.sort((a: any, b: any) => {
                const tA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
                const tB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
                return tB - tA;
            });

            setDms(sorted);
            await setCachedData(CacheKey.DMs, sorted);
        } catch (error) {
            console.error("Failed to fetch DMs", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <List isLoading={isLoading}>
            {dms.map((dm) => (
                <List.Item
                    key={dm.id}
                    title={dm.recipient}
                    subtitle={dm.lastMessage?.content || "No messages"}
                    icon={dm.avatar ? { source: dm.avatar, mask: Image.Mask.Circle } : Icon.Person}
                    accessories={[{ text: dm.lastMessage?.timestamp ? new Date(dm.lastMessage.timestamp).toLocaleDateString() : "" }]}
                    actions={
                        <ActionPanel>
                            <Action title="Open Chat" onAction={() => push(<DmChat channelId={dm.id} recipientName={dm.recipient} />)} />
                            <Action.CopyToClipboard title="Copy User ID" content={dm.id} />
                        </ActionPanel>
                    }
                />
            ))}
        </List>
    );
}
