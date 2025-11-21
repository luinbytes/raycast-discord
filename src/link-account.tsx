import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { Client } from "discord.js-selfbot-v13";
import { setCachedData, CacheKey } from "./utils/cache";

export default function Command() {
    const [token, setToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { pop } = useNavigation();
    async function handleSubmit(values: { token: string }) {
        setIsLoading(true);
        const toast = await showToast({ style: Toast.Style.Animated, title: "Validating Token..." });

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const options: any = { checkUpdate: false };
            const client = new Client(options);
            await client.login(values.token);

            // Token is valid, save it
            await setCachedData(CacheKey.Token, values.token);

            // Cache basic user info immediately
            const userInfo = {
                id: client.user?.id,
                username: client.user?.username,
                discriminator: client.user?.discriminator,
                avatar: client.user?.avatarURL(),
            };
            await setCachedData(CacheKey.UserInfo, userInfo);

            client.destroy();

            toast.style = Toast.Style.Success;
            toast.title = "Account Linked!";
            toast.message = `Logged in as ${userInfo.username}`;

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
