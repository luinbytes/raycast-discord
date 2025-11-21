import { Action, ActionPanel, List, Icon, useNavigation, Form, showToast, Toast, Detail } from "@raycast/api";
import { useEffect, useState } from "react";
import { getDiscordClient } from "../utils/client";

interface Message {
    id: string;
    content: string;
    author: {
        username: string;
        avatar: string | null;
        bot: boolean;
    };
    timestamp: Date;
}

export default function DmChat({ channelId, recipientName }: { channelId: string, recipientName: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyContent, setReplyContent] = useState("");

    useEffect(() => {
        loadMessages();
    }, [channelId]);

    async function loadMessages() {
        try {
            const client = await getDiscordClient();
            const channel = await client.channels.fetch(channelId) as any;
            if (!channel) throw new Error("Channel not found");

            const fetched = await channel.messages.fetch({ limit: 20 });
            const mapped = fetched.map((m: any) => ({
                id: m.id,
                content: m.content,
                author: {
                    username: m.author.username,
                    avatar: m.author.displayAvatarURL({ format: "png" }),
                    bot: m.author.bot
                },
                timestamp: m.createdAt
            }));

            setMessages(mapped);
        } catch (error) {
            showToast({ style: Toast.Style.Failure, title: "Failed to load messages" });
        } finally {
            setIsLoading(false);
        }
    }

    async function sendMessage() {
        if (!replyContent.trim()) return;
        const toast = await showToast({ style: Toast.Style.Animated, title: "Sending..." });
        try {
            const client = await getDiscordClient();
            const channel = await client.channels.fetch(channelId) as any;
            await channel.send(replyContent);

            setReplyContent("");
            toast.style = Toast.Style.Success;
            toast.title = "Sent";
            loadMessages(); // Refresh
        } catch (e) {
            toast.style = Toast.Style.Failure;
            toast.title = "Failed to send";
        }
    }

    return (
        <List
            isLoading={isLoading}
            navigationTitle={`Chat with ${recipientName}`}
            isShowingDetail
            searchBarPlaceholder="Type a message..."
            searchText={replyContent}
            onSearchTextChange={setReplyContent}
        >
            {messages.length === 0 && !isLoading && <List.EmptyView title="No messages" />}

            {/* Input Item as the first item to simulate a chat input if we want, 
           but Raycast doesn't have a bottom input. 
           We can use the Search Bar as input or a separate Form. 
           For now, let's use a "Send Message" action on any item or a specific "Compose" item.
       */}

            <List.Item
                title="Type in search bar and press Enter to send"
                icon={Icon.Pencil}
                actions={
                    <ActionPanel>
                        <Action title="Send Message" onAction={sendMessage} />
                    </ActionPanel>
                }
            />

            {messages.map((msg) => (
                <List.Item
                    key={msg.id}
                    title={msg.author.username}
                    subtitle={msg.content}
                    icon={msg.author.avatar ? { source: msg.author.avatar, mask: Icon.Circle } : Icon.Person}
                    detail={
                        <List.Item.Detail markdown={`**${msg.author.username}** at ${msg.timestamp.toLocaleTimeString()}\n\n${msg.content}`} />
                    }
                    actions={
                        <ActionPanel>
                            <Action title="Send Message" onAction={sendMessage} />
                            <Action.CopyToClipboard title="Copy Message" content={msg.content} />
                        </ActionPanel>
                    }
                />
            ))}
        </List>
    );
}
