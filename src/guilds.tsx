```typescript
import { Action, ActionPanel, List, Image, Icon, useNavigation, LocalStorage } from "@raycast/api";
import { useEffect, useState } from "react";
import { getCachedData, setCachedData, CacheKey } from "./utils/cache";
import { getDiscordClient } from "./utils/client";
import GuildChannels from "./views/GuildChannels";

interface Guild {
  id: string;
  name: string;
  icon: string | null;
}

export default function Command() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { push } = useNavigation();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const pinned = await LocalStorage.getItem<string>("pinned_guilds");
    const pinnedList = pinned ? JSON.parse(pinned) : [];
    setPinnedIds(pinnedList);

    const cachedGuilds = await getCachedData<Guild[]>(CacheKey.Guilds);
    if (cachedGuilds) {
      setGuilds(sortGuilds(cachedGuilds, pinnedList));
      setIsLoading(false);
    }

    try {
      const client = await getDiscordClient();
      const fetchedGuilds = client.guilds.cache.map((g: any) => ({
        id: g.id,
        name: g.name,
        icon: g.iconURL({ format: "png" }),
      }));
      
      setGuilds(sortGuilds(fetchedGuilds, pinnedList));
      await setCachedData(CacheKey.Guilds, fetchedGuilds);
    } catch (error) {
      console.error("Failed to fetch guilds", error);
    } finally {
      setIsLoading(false);
    }
  }

  function sortGuilds(list: Guild[], pinned: string[]) {
      return [...list].sort((a, b) => {
          const isAPinned = pinned.includes(a.id);
          const isBPinned = pinned.includes(b.id);
          if (isAPinned && !isBPinned) return -1;
          if (!isAPinned && isBPinned) return 1;
          return 0;
      });
  }

  async function togglePin(id: string) {
      const newPinned = pinnedIds.includes(id) 
        ? pinnedIds.filter(p => p !== id)
        : [...pinnedIds, id];
      
      setPinnedIds(newPinned);
      await LocalStorage.setItem("pinned_guilds", JSON.stringify(newPinned));
      setGuilds(sortGuilds(guilds, newPinned));
  }

  return (
    <List isLoading={isLoading}>
      {guilds.map((guild) => (
        <List.Item
          key={guild.id}
          title={guild.name}
          icon={guild.icon ? { source: guild.icon, mask: Image.Mask.Circle } : Icon.Globe}
          accessories={[{ icon: pinnedIds.includes(guild.id) ? Icon.Pin : undefined }]}
          actions={
            <ActionPanel>
              <Action title="Open Guild" onAction={() => push(<GuildChannels guildId={guild.id} guildName={guild.name} />)} />
              <Action title={pinnedIds.includes(guild.id) ? "Unpin" : "Pin to Top"} icon={Icon.Pin} onAction={() => togglePin(guild.id)} />
              <Action.CopyToClipboard title="Copy Guild ID" content={guild.id} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
```
