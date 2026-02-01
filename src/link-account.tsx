import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { setCachedData, CacheKey } from "./utils/cache";

// Discord API user response type
interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    global_name: string | null;
}

// Use Discord's REST API directly to validate token and get user info
// This is much lighter than the full WebSocket client and avoids OOM issues
async function validateTokenAndGetUserInfo(token: string) {
    const response = await fetch("https://discord.com/api/v10/users/@me", {
        headers: {
            Authorization: token,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Token validation failed: ${response.statusText}`);
    }

    const userData = (await response.json()) as DiscordUser;
    return {
        id: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null,
    };
}

export default function Command() {
    const [token, setToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { pop } = useNavigation();

    async function handleSubmit(values: { token: string }) {
        setIsLoading(true);
        const toast = await showToast({ style: Toast.Style.Animated, title: "Validating Token..." });

        try {
            // Validate token and get user info using REST API (lightweight)
            const userInfo = await validateTokenAndGetUserInfo(values.token);

            // Token is valid, save it
            await setCachedData(CacheKey.Token, values.token);

            // Cache user info
            await setCachedData(CacheKey.UserInfo, userInfo);

            toast.style = Toast.Style.Success;
            toast.title = "Account Linked!";
            toast.message = `Logged in as ${userInfo.username}${userInfo.discriminator !== '0' ? `#${userInfo.discriminator}` : ''}`;

            setTimeout(() => pop(), 1000);
        } catch (error) {
            toast.style = Toast.Style.Failure;
            toast.title = "Failed to Link Account";
            toast.message = error instanceof Error ? error.message : "Invalid Token";
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form
            isLoading={isLoading}
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Link Account" onSubmit={handleSubmit} />
                </ActionPanel>
            }
        >
            <Form.Description
                title="⚠️ TOS WARNING"
                text="Using a user token with a bot library (Selfbot) is technically against Discord's Terms of Service. Use at your own risk."
            />
            <Form.Separator />
            <Form.PasswordField
                id="token"
                title="Discord Token"
                placeholder="Enter your user token"
                value={token}
                onChange={setToken}
            />
        </Form>
    );
}
