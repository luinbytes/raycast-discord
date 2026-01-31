/**
 * Memory monitoring utilities for debugging and optimization.
 */

interface MemoryUsage {
    rss: number; // Resident Set Size in MB
    heapTotal: number; // Total heap size in MB
    heapUsed: number; // Used heap size in MB
    external: number; // External memory in MB
    arrayBuffers: number; // ArrayBuffer memory in MB
}

/**
 * Get current memory usage if available.
 */
export function getMemoryUsage(): MemoryUsage | null {
    if (typeof process !== "undefined" && process.memoryUsage) {
        const usage = process.memoryUsage();
        return {
            rss: bytesToMB(usage.rss),
            heapTotal: bytesToMB(usage.heapTotal),
            heapUsed: bytesToMB(usage.heapUsed),
            external: bytesToMB(usage.external),
            arrayBuffers: bytesToMB(usage.arrayBuffers || 0),
        };
    }
    return null;
}

/**
 * Convert bytes to megabytes.
 */
function bytesToMB(bytes: number): number {
    return Math.round(bytes / 1024 / 1024 * 100) / 100;
}

/**
 * Log current memory usage to console.
 */
export function logMemoryUsage(label: string = "Memory Usage"): void {
    const usage = getMemoryUsage();
    if (usage) {
        console.log(`[${label}] RSS: ${usage.rss}MB, Heap: ${usage.heapUsed}/${usage.heapTotal}MB, External: ${usage.external}MB`);
    } else {
        console.log(`[${label}] Memory usage not available`);
    }
}

/**
 * Check if memory usage is critical (>80% of heap).
 */
export function isMemoryCritical(): boolean {
    const usage = getMemoryUsage();
    if (!usage) return false;
    return usage.heapUsed / usage.heapTotal > 0.8;
}

/**
 * Attempt to force garbage collection if available.
 * Requires Node.js to be started with --expose-gc flag.
 */
export function forceGarbageCollection(): boolean {
    if (typeof global !== "undefined" && global.gc) {
        global.gc();
        return true;
    }
    return false;
}

/**
 * Get memory usage as a formatted string.
 */
export function getMemoryUsageString(): string {
    const usage = getMemoryUsage();
    if (!usage) return "Memory usage not available";
    return `RSS: ${usage.rss}MB, Heap: ${usage.heapUsed}/${usage.heapTotal}MB (${Math.round(usage.heapUsed / usage.heapTotal * 100)}%)`;
}
