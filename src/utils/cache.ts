import { LocalStorage } from "@raycast/api";

export enum CacheKey {
  Guilds = "cache_guilds",
  DMs = "cache_dms",
  Friends = "cache_friends",
  UserInfo = "cache_user_info",
  Token = "discord_token",
}

export async function getCachedData<T>(key: CacheKey): Promise<T | null> {
  const data = await LocalStorage.getItem<string>(key);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    console.error(`Failed to parse cache for key ${key}`, e);
    return null;
  }
}

export async function setCachedData(key: CacheKey, data: any): Promise<void> {
  await LocalStorage.setItem(key, JSON.stringify(data));
}

export async function clearCache(key: CacheKey): Promise<void> {
  await LocalStorage.removeItem(key);
}
