# Discord for Raycast

Fully integrate Discord into your Raycast workflow! This extension allows you to check DMs, view servers, and monitor user activity directly from Raycast.

> **⚠️ IMPORTANT WARNING:** This extension uses `discord.js-selfbot-v13` to automate a user account. **Using selfbots is against Discord's Terms of Service** and may result in your account being banned. Use this extension at your own risk.

## Features

### 🔗 Account Linking
- **Secure Token Storage**: Discord token stored securely in Raycast LocalStorage
- **Easy Setup**: One-time connection via "Link Account" command
- **Token Validation**: Validates token format and connectivity on setup

### 📊 Dashboard
Get a quick overview of your Discord presence:
- Current account username and discriminator
- Account status (online, idle, dnd, offline)
- Quick access to all commands

### 💬 Direct Messages
View and manage your Direct Messages without opening Discord:
- **List DMs**: Sorted by most recent activity with message preview
- **Chat View**: Full chat interface to read and send messages
- **Real-time Updates**: Messages appear as they arrive
- **Multi-DM Support**: Switch between multiple conversations easily

### 🏰 Server Management (Guilds)
Browse all servers you're a member of:
- **Guild List**: View all your Discord servers
- **Server Info**: See server names and icons
- **Quick Access**: Jump to any server with a single command

### 🕵️ Spy Mode (User Activity Monitor)
Monitor a specific user's activity in real-time:
- **Message Tracking**: See all messages sent by the user
- **Edit/Delete Tracking**: Detect when messages are edited or deleted
- **Typing Status**: Know when they're typing
- **Presence Changes**: Track online/idle/dnd/offline status
- **Voice Activity**: See when they join/leave voice channels
- **Real-time Logs**: All events logged instantly

> **Note:** Spy Mode requires the User ID of the person you want to monitor. You can find this in Discord by enabling Developer Mode and right-clicking a user → Copy ID.

## Installation

### Requirements
- [Raycast](https://www.raycast.com/) installed (macOS only)
- Discord account (user token required)
- Node.js 18+ (for development)

### From Source

1. **Clone the repository:**
   ```bash
   git clone https://github.com/luinbytes/raycast-discord.git
   cd raycast-discord
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run in development mode:**
   ```bash
   npm run dev
   ```

## Usage

### Step 1: Link Your Discord Account

1. Open Raycast
2. Search for "Link Account" (Discord extension)
3. Paste your Discord user token
4. Click "Link Account"

**How to get your Discord token:**
> **WARNING:** Sharing your Discord token is risky. Only use this with trusted extensions and never share it publicly.

1. Open Discord in your browser
2. Press `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux) to open DevTools
3. Go to the **Application** tab
4. Expand **Local Storage** → Select `https://discord.com`
5. Find the `token` key and copy its value
6. Paste it into the Raycast extension

### Step 2: Check Direct Messages

1. Open Raycast
2. Search for "Direct Messages"
3. View your recent DMs with latest message preview
4. Select a DM to open the chat view
5. Type and send messages directly from Raycast

### Step 3: Browse Servers

1. Open Raycast
2. Search for "Guilds"
3. View all Discord servers you're a member of
4. Use keyboard navigation to browse

### Step 4: Spy Mode (Monitor a User)

1. Open Raycast
2. Search for "Spy Mode"
3. Enter the User ID you want to monitor
4. Watch real-time activity logs

**What you'll see:**
- Messages sent by the user
- Messages that are edited or deleted
- When they start/stop typing
- Status changes (online, idle, dnd, offline)
- Voice channel join/leave events

## Screenshots

*Screenshots coming soon!*

## Troubleshooting

### "Invalid Token" Error
- Make sure you copied the entire token (it's long)
- Check that your Discord account is still logged in
- Regenerate your token by logging out and back into Discord

### Commands Not Appearing in Raycast
- Make sure the extension is enabled in Raycast Preferences
- Try restarting Raycast
- Check the extension is in the correct directory

### Spy Mode Not Working
- Verify the User ID is correct (19-digit number)
- Make sure the user is not blocking your account
- Check that you share at least one server with the user
- Ensure you've linked your account first

### Messages Not Sending
- Check your Discord token is still valid
- Verify you have internet connectivity
- Make sure you're not rate-limited by Discord

### Connection Issues
- Discord may be experiencing an outage (check [Discord Status](https://status.discord.com/))
- Try relinking your account
- Check your token hasn't been invalidated

## Security & Privacy

### ⚠️ Selfbot Risks

**What is a selfbot?**
A selfbot is an automated account that uses a user token instead of a bot token. While similar to bots, selfbots violate Discord's Terms of Service.

**Risks:**
- **Account Ban**: Discord actively detects and bans accounts using selfbots
- **Token Compromise**: Your token gives full access to your account
- **Data Loss**: Selfbot bans are often permanent

**Best Practices:**
- Use a dedicated account (not your main)
- Never share your Discord token
- Monitor for detection (suspicious behavior, failed logins)
- Understand the risks before proceeding

### Data Storage

- **Token**: Stored locally in Raycast LocalStorage (encrypted)
- **Chat Messages**: Not stored persistently (in-memory only)
- **User Data**: Only what's necessary for the extension to function

### Network Activity

This extension connects to Discord's servers to:
- Authenticate with your token
- Fetch DMs and server list
- Send and receive messages
- Monitor user activity (Spy Mode)

All communication goes through Discord's official API endpoints.

## Development

### Project Structure

```
src/
├── link-account.tsx          # Account linking command
├── dashboard.tsx             # Dashboard overview
├── direct-messages.tsx       # DM list view
├── chat.tsx                  # Chat interface
├── guilds.tsx                # Server list view
└── spy-mode.tsx              # User activity monitor
```

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Linting

```bash
npm run lint
```

## Tech Stack

- **Raycast API**: Extension framework
- **React**: UI components
- **discord.js-selfbot-v13**: Discord client library for user accounts

## License

MIT License

## Contributing

Contributions are welcome! However, please note:
- Selfbot features are inherently risky
- Test thoroughly before submitting PRs
- Document any security considerations
- Follow Discord's guidelines where possible

## Acknowledgments

- [Raycast](https://www.raycast.com/) for the amazing platform
- [discord.js-selfbot-v13](https://github.com/aiko-chan-ai/discord.js-selfbot-v13) for the client library

## Disclaimer

**This extension is provided as-is for educational purposes. The author is not responsible for any account bans, data loss, or other consequences resulting from its use. Use at your own risk.**

---

**Stay connected, stay safe! 💬**
