import connectDB from "@/lib/mongodb";
import Settings from "@/models/Settings";
import { revalidateTag } from "next/cache";

// In-memory cache for settings (lightweight)
let settingsCache: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Simple cache without Next.js unstable_cache to avoid size limits
export async function getCachedSettings() {
  const now = Date.now();
  
  // Return in-memory cached settings if still valid
  if (settingsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return settingsCache;
  }

  try {
    await connectDB();
    const settings = await Settings.findOne().lean();
    
    if (settings) {
      // Cache the settings in memory only (no Next.js cache due to size)
      settingsCache = settings;
      cacheTimestamp = now;
      console.log("Settings cached in memory (avoiding Next.js cache size limit)");
      return settings;
    }
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    
    // Return cached settings even if expired, better than nothing
    if (settingsCache) {
      console.log("Returning expired cached settings due to error");
      return settingsCache;
    }
  }

  // Fallback settings
  return {
    shopName: "Sai Nandhini Tasty World",
    contactEmail: "info@sainandhini.com",
    contactPhone: "+91 96009 16065",
    logo: "",
    socialMedia: {},
  };
}

// Clear cache when settings are updated
export function clearSettingsCache() {
  settingsCache = null;
  cacheTimestamp = 0;
  console.log("Settings cache cleared");
}

// Force refresh settings cache
export async function refreshSettingsCache() {
  clearSettingsCache();
  return await getCachedSettings();
}