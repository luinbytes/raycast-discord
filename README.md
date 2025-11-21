# Discord for Raycast

Fully integrate Discord into your Raycast workflow! This extension allows you to check DMs, view servers, and even monitor user activity directly from Raycast.

> **⚠️ WARNING:** This extension uses `discord.js-selfbot-v13` to automate a user account. **Using selfbots is against Discord's Terms of Service** and may result in your account being banned. Use this extension at your own risk.

## Features

### 🔗 Link Account
Connect your Discord account to Raycast to enable all features.

### 📊 Dashboard
Get a quick overview of your Discord status and activities.

### 💬 Direct Messages
View your recent Direct Messages (DMs) and chat with friends without leaving Raycast.
- **List DMs:** See a sorted list of your DMs with the latest message preview.
- **Chat:** Open a chat view to send and receive messages.

### 🏰 Guilds
View a list of the servers (Guilds) you are a member of.

### 🕵️ Spy Mode
Live monitor a specific user's activity.
- **Track:** Messages, message deletions/edits, typing status, presence changes, and voice channel activity.
- **Real-time Logs:** Watch events happen in real-time for the specified User ID.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd discord
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the extension in development mode:**
    ```bash
    npm run dev
    ```

## Usage

1.  Open Raycast.
2.  Run the **Link Account** command to set up your connection.
3.  Use **Direct Messages** to check your chats.
4.  Use **Spy Mode** and enter a User ID to start monitoring a specific user.

## Technologies

- [Raycast API](https://developers.raycast.com/)
- [React](https://reactjs.org/)
- [discord.js-selfbot-v13](https://github.com/aiko-chan-ai/discord.js-selfbot-v13)

## License

MIT
