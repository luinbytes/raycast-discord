import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useState } from "react";
import { setCachedData, CacheKey } from "./utils/cache";
import { validateToken, destroyClient, getClientMemoryInfo } from "./utils/client";

export default function Command() {
    const [token, setToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { pop } = useNavigation();

    async function handleSubmit(values: { token: string }) {
        setIsLoading(true);
        const toast = await showToast({ style: Toast.Style.Animated, title: "Validating Token..." });

        try {
            // Log current memory state
            const memoryInfo = getClientMemoryInfo();
            console.log("Memory info before validation:", memoryInfo);

            // Validate token using dedicated function (properly cleans up)
            const result = await validateToken(values.token);

            if (!result.valid || !result.user) {
                throw new Error(result.error || "Invalid token");
            }

            // Token is valid, save it
            await setCachedData(CacheKey.Token, values.token);

            // Cache basic user info immediately
            await setCachedData(CacheKey.UserInfo, result.user);

            toast.style = Toast.Style.Success;
            toast.title = "Account Linked!";
            toast.message = `Logged in as ${result.user.username}`;

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
