import { Action, ActionPanel, Grid, Icon, Image, showToast, Toast, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import { getCachedData, setCachedData, CacheKey } from "./utils/cache";
import { getDiscordClient } from "./utils/client";

interface UserInfo {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    banner?: string | null;
    bio?: string;
    createdAt?: Date;
}

export default function Command() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const cachedUser = await getCachedData<UserInfo>(CacheKey.UserInfo);
        if (cachedUser) {
            setUserInfo(cachedUser);
            setIsLoading(false);
        }

        try {
            const client = await getDiscordClient();

            // Fetch full user profile if possible (selfbots can sometimes access this)
            // Note: client.user is the current user.
            const user = client.user;
            if (!user) return;

            const newUserInfo: UserInfo = {
                id: user.id,
                username: user.username,
                discriminator: user.discriminator,
                avatar: user.displayAvatarURL({ format: "png", size: 512 }) ?? null,
                banner: user.bannerURL({ format: "png", size: 1024 }) ?? null,
                bio: (user as any).bio, // Bio might be on the user object in some versions or require fetch
                createdAt: user.createdAt,
            };

            setUserInfo(newUserInfo);
            await setCachedData(CacheKey.UserInfo, newUserInfo);

            // Cache Guilds (simplified for now)
            const guilds = client.guilds.cache.map((g: any) => ({
                id: g.id,
                name: g.name,
                icon: g.iconURL({ format: "png" }),
            }));
            await setCachedData(CacheKey.Guilds, guilds);

            // Cache DMs (simplified)
            const dms = client.channels.cache
                .filter((c: any) => c.type === "DM")
                .map((c: any) => ({
                    id: c.id,
                    recipient: c.recipient?.username
                }));
            await setCachedData(CacheKey.DMs, dms);

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            if (!userInfo) {
                showToast({ style: Toast.Style.Failure, title: "Failed to connect", message: "Please check your token or internet connection." });
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function setStatus(status: "online" | "idle" | "dnd" | "invisible") {
        const toast = await showToast({ style: Toast.Style.Animated, title: "Updating Status..." });
        try {
            const client = await getDiscordClient();
            // Selfbots use setPresence slightly differently sometimes, but this is the standard v13 API
            client.user?.setPresence({ status: status });

            toast.style = Toast.Style.Success;
            toast.title = "Status Updated";
            toast.message = `Set to ${status}`;
        } catch (e) {
            console.error(e);
            toast.style = Toast.Style.Failure;
            toast.title = "Failed to update status";
        }
    }

    if (isLoading && !userInfo) {
        return <Grid isLoading={true} />;
    }

    return (
        <Grid itemSize={Grid.ItemSize.Medium}>
            <Grid.Section title="User Profile">
                {userInfo && (
                    <Grid.Item
                        id="user"
                        title={userInfo.username}
                        subtitle={`#${userInfo.discriminator}`}
                        content={userInfo.avatar || Icon.Person}
                        actions={
                            <ActionPanel>
                                <Action.CopyToClipboard title="Copy User ID" content={userInfo.id} />
                                <Action.CopyToClipboard title="Copy Username" content={`${userInfo.username}#${userInfo.discriminator}`} />
                            </ActionPanel>
                        }
                    />
                )}
                {userInfo?.banner && (
                    <Grid.Item
                        id="banner"
                        title="Banner"
                        content={{ source: userInfo.banner }}
                        actions={
                            <ActionPanel>
                                <Action.CopyToClipboard title="Copy Banner URL" content={userInfo.banner} />
                            </ActionPanel>
                        }
                    />
                )}
            </Grid.Section>

            <Grid.Section title="Quick Actions">
                <StatusItem status="online" label="Online" color="#3ba55c" onSet={() => setStatus("online")} />
                <StatusItem status="idle" label="Idle" color="#faa61a" onSet={() => setStatus("idle")} />
                <StatusItem status="dnd" label="Do Not Disturb" color="#ed4245" onSet={() => setStatus("dnd")} />
                <StatusItem status="invisible" label="Invisible" color="#747f8d" onSet={() => setStatus("invisible")} />
            </Grid.Section>
        </Grid>
    );
}

function StatusItem({ status, label, color, onSet }: { status: string, label: string, color: string, onSet: () => void }) {
    return (
        <Grid.Item
            id={`status-${status}`}
            title={`Set ${label}`}
            content={{ source: Icon.Circle, tintColor: color }}
            actions={
                <ActionPanel>
                    <Action title={`Set ${label}`} onAction={onSet} />
                </ActionPanel>
            }
        />
    );
}
