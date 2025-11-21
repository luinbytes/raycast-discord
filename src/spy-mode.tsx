import { Action, ActionPanel, List, Icon, useNavigation, Form, showToast, Toast } from "@raycast/api";
import { useEffect, useState, useRef } from "react";
import { getDiscordClient } from "./utils/client";

interface LogEntry {
    id: string;
    timestamp: Date;
    type: "message" | "presence" | "typing" | "voice";
    description: string;
}

export default function Command() {
    const [targetId, setTargetId] = useState("");
    const [isSpying, setIsSpying] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const clientRef = useRef<any>(null);

    async function startSpying() {
        if (!targetId) {
            showToast({ style: Toast.Style.Failure, title: "User ID required" });
            return;
        }

        try {
            const client = await getDiscordClient();
            clientRef.current = client;
            setIsSpying(true);

            showToast({ style: Toast.Style.Success, title: "Spy Mode Activated", message: `Watching ${targetId}` });

            // Message Create
            client.on("messageCreate", (msg: any) => {
                if (msg.author.id === targetId) {
                    addLog("message", `Sent message in ${msg.guild ? msg.guild.name : "DM"}: ${msg.content}`);
                }
            });

            // Message Delete
            client.on("messageDelete", (msg: any) => {
                if (msg.author?.id === targetId) {
                    addLog("message", `Deleted message in ${msg.guild ? msg.guild.name : "DM"}`);
                }
            });

            // Message Update
            client.on("messageUpdate", (oldMsg: any, newMsg: any) => {
                if (newMsg.author?.id === targetId) {
                    addLog("message", `Edited message in ${newMsg.guild ? newMsg.guild.name : "DM"}: ${newMsg.content}`);
                }
            });

            // Typing Start
            client.on("typingStart", (typing: any) => {
                if (typing.user.id === targetId) {
                    addLog("typing", `Started typing in ${typing.channel.type === "DM" ? "DM" : typing.channel.name}`);
                }
            });

            // Presence Update
            client.on("presenceUpdate", (oldPresence: any, newPresence: any) => {
                if (newPresence.userId === targetId) {
                    const activities = newPresence.activities.map((a: any) => a.name).join(", ");
                    addLog("presence", `Status: ${newPresence.status} ${activities ? `| Playing: ${activities}` : ""}`);
                }
            });

            // Voice State Update
            client.on("voiceStateUpdate", (oldState: any, newState: any) => {
                if (newState.id === targetId) {
                    if (newState.channelId && !oldState.channelId) {
                        addLog("voice", `Joined voice channel ${newState.channel?.name}`);
                    } else if (!newState.channelId && oldState.channelId) {
                        addLog("voice", `Left voice channel`);
                    } else if (newState.channelId && oldState.channelId && newState.channelId !== oldState.channelId) {
                        addLog("voice", `Moved to voice channel ${newState.channel?.name}`);
                    }

                    if (newState.selfMute !== oldState.selfMute) addLog("voice", newState.selfMute ? "Self Muted" : "Unmuted");
                    if (newState.selfDeaf !== oldState.selfDeaf) addLog("voice", newState.selfDeaf ? "Self Deafened" : "Undeafened");
                    if (newState.streaming !== oldState.streaming) addLog("voice", newState.streaming ? "Started Streaming" : "Stopped Streaming");
                }
            });

        } catch (e) {
            showToast({ style: Toast.Style.Failure, title: "Failed to start spy mode" });
            setIsSpying(false);
        }
    }

    function addLog(type: LogEntry["type"], description: string) {
        setLogs(prev => [{
            id: Math.random().toString(),
            timestamp: new Date(),
            type,
            description
        }, ...prev]);
    }

    if (!isSpying) {
        return (
            <Form
                actions={
                    <ActionPanel>
                        <Action.SubmitForm title="Start Spying" onSubmit={startSpying} />
                    </ActionPanel>
                }
            >
                <Form.TextField
                    id="targetId"
                    title="Target User ID"
                    placeholder="Enter User ID to spy on"
                    value={targetId}
                    onChange={setTargetId}
                />
            </Form>
        );
    }

    return (
        <List>
            {logs.map(log => (
                <List.Item
                    key={log.id}
                    title={log.description}
                    subtitle={log.timestamp.toLocaleTimeString()}
                    icon={getIconForType(log.type)}
                />
            ))}
        </List>
    );
}

function getIconForType(type: LogEntry["type"]) {
    switch (type) {
        case "message": return Icon.Message;
        case "presence": return Icon.Circle;
        case "typing": return Icon.Pencil;
        case "voice": return Icon.Microphone;
        default: return Icon.Dot;
    }
}
