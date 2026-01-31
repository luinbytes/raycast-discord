import { LocalStorage } from "@raycast/api";

// Cache configuration
const CACHE_MAX_SIZE_MB = 5; // Max 5MB per cache entry
const CACHE_MAX_ITEMS = {
    [CacheKey.DMs]: 50, // Max 50 DMs
    [CacheKey.Guilds]: 100, // Max 100 guilds
    [CacheKey.Friends]: 100, // Max 100 friends
};

export enum CacheKey {
  Guilds = "cache_guilds",
  DMs = "cache_dms",
  Friends = "cache_friends",
  UserInfo = "cache_user_info",
  Token = "discord_token",
}

/**
 * Estimate the size of a string in bytes.
 */
function estimateSize(str: string): number {
    return new Blob([str]).size;
}

/**
 * Truncate cache data if it exceeds size limits.
 */
function truncateCacheIfNeeded<T>(key: CacheKey, data: any): any {
    if (!Array.isArray(data)) {
        return data;
    }

    const maxSize = CACHE_MAX_ITEMS[key as keyof typeof CACHE_MAX_ITEMS];
    if (!maxSize) {
        return data;
    }

    if (data.length > maxSize) {
        console.log(`Truncating cache ${key} from ${data.length} to ${maxSize} items`);
        return data.slice(0, maxSize);
    }

    return data;
}

/**
 * Get cached data from LocalStorage.
 */
export async function getCachedData<T>(key: CacheKey): Promise<T | null> {
    try {
        const data = await LocalStorage.getItem<string>(key);
        if (!data) return null;

        // Check cache size before parsing
        const size = estimateSize(data);
        const maxSizeBytes = CACHE_MAX_SIZE_MB * 1024 * 1024;
        if (size > maxSizeBytes) {
            console.warn(`Cache ${key} exceeds size limit (${(size / 1024 / 1024).toFixed(2)}MB > ${CACHE_MAX_SIZE_MB}MB), clearing it`);
            await LocalStorage.removeItem(key);
            return null;
        }

        return JSON.parse(data) as T;
    } catch (e) {
        console.error(`Failed to parse cache for key ${key}`, e);
        // Clear corrupted cache
        await LocalStorage.removeItem(key);
        return null;
    }
}

/**
 * Set cached data in LocalStorage with size limits.
 */
export async function setCachedData(key: CacheKey, data: any): Promise<void> {
    try {
        // Truncate data if needed
        const processedData = truncateCacheIfNeeded(key, data);

        const jsonString = JSON.stringify(processedData);
        const size = estimateSize(jsonString);
        const maxSizeBytes = CACHE_MAX_SIZE_MB * 1024 * 1024;

        if (size > maxSizeBytes) {
            throw new Error(`Data size (${(size / 1024 / 1024).toFixed(2)}MB) exceeds cache limit (${CACHE_MAX_SIZE_MB}MB)`);
        }

        await LocalStorage.setItem(key, jsonString);
        console.log(`Cached ${key}: ${(size / 1024).toFixed(2)}KB`);
    } catch (error) {
        console.error(`Failed to cache data for key ${key}:`, error);
        throw error;
    }
}

/**
 * Clear a specific cache entry.
 */
export async function clearCache(key: CacheKey): Promise<void> {
    await LocalStorage.removeItem(key);
}

/**
 * Clear all Discord-related cache except token.
 */
export async function clearAllCache(): Promise<void> {
    await LocalStorage.removeItem(CacheKey.Guilds);
    await LocalStorage.removeItem(CacheKey.DMs);
    await LocalStorage.removeItem(CacheKey.Friends);
    await LocalStorage.removeItem(CacheKey.UserInfo);
    console.log("All Discord cache cleared");
}

/**
 * Get cache size information.
 */
export async function getCacheSizeInfo(): Promise<{ [key: string]: number }> {
    const sizes: { [key: string]: number } = {};

    for (const key of Object.values(CacheKey)) {
        const data = await LocalStorage.getItem<string>(key);
        if (data) {
            sizes[key] = estimateSize(data);
        }
    }

    return sizes;
}
