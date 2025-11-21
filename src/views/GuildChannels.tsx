import { Action, ActionPanel, List, Icon, useNavigation, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { getDiscordClient } from "../utils/client";
import DmChat from "./DmChat"; // Reuse chat view for channels

interface Channel {
    id: string;
    name: string;
    type: "GUILD_TEXT" | "GUILD_VOICE" | "GUILD_CATEGORY" | string;
    parentId?: string | null;
}

export default function GuildChannels({ guildId, guildName }: { guildId: string, guildName: string }) {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { push } = useNavigation();

    useEffect(() => {
        loadChannels();
    }, [guildId]);

    async function loadChannels() {
        try {
            const client = await getDiscordClient();
            const guild = await client.guilds.fetch(guildId);
            if (!guild) throw new Error("Guild not found");

            const fetched = await guild.channels.fetch();
            const mapped = fetched.map((c: any) => ({
                id: c.id,
                name: c.name,
                type: c.type,
                parentId: c.parentId
            }));

            // Sort: Categories first, then by position (not implemented here, just name for now)
            // A proper sort would require 'position' property
            setChannels(mapped);
        } catch (error) {
            showToast({ style: Toast.Style.Failure, title: "Failed to load channels" });
        } finally {
            setIsLoading(false);
        }
    }

    // Group by category? Raycast List supports sections.
    // Let's try to group by category if possible.
    const categories = channels.filter(c => c.type === "GUILD_CATEGORY");
    const textChannels = channels.filter(c => c.type === "GUILD_TEXT");
    const voiceChannels = channels.filter(c => c.type === "GUILD_VOICE");
    const others = channels.filter(c => !["GUILD_CATEGORY", "GUILD_TEXT", "GUILD_VOICE"].includes(c.type));

    return (
        <List isLoading={isLoading} navigationTitle={guildName}>
            {categories.map(cat => (
                <List.Section key={cat.id} title={cat.name}>
                    {textChannels.filter(c => c.parentId === cat.id).map(c => (
                        <List.Item
                            key={c.id}
                            title={`# ${c.name}`}
                            icon={Icon.Bubble}
                            actions={
                                <ActionPanel>
                                    <Action title="Open Channel" onAction={() => push(<DmChat channelId={c.id} recipientName={`#${c.name}`} />)} />
                                </ActionPanel>
                            }
                        />
                    ))}
                    {voiceChannels.filter(c => c.parentId === cat.id).map(c => (
                        <List.Item
                            key={c.id}
                            title={`🔊 ${c.name}`}
                            icon={Icon.Microphone}
                            actions={<ActionPanel><Action title="Join Voice (Not Implemented)" onAction={() => { }} /></ActionPanel>}
                        />
                    ))}
                </List.Section>
            ))}

            <List.Section title="Uncategorized">
                {textChannels.filter(c => !c.parentId).map(c => (
                    <List.Item
                        key={c.id}
                        title={`# ${c.name}`}
                        icon={Icon.Bubble}
                        actions={
                            <ActionPanel>
                                <Action title="Open Channel" onAction={() => push(<DmChat channelId={c.id} recipientName={`#${c.name}`} />)} />
                            </ActionPanel>
                        }
                    />
                ))}
            </List.Section>
        </List>
    );
}
