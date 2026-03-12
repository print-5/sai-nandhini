#!/usr/bin/env node

/**
 * Migration Script: Move base64 images to Cloudinary
 * This script migrates logo and favicon from base64 to Cloudinary URLs
 */

import { MongoClient } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(base64Image, folder, filename) {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      public_id: filename,
      resource_type: "image",
      quality: "auto",
      format: "auto",
    });
    
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

async function migrateSettings() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db();
    const settingsCollection = db.collection('settings');
    
    // Find settings with base64 images
    const settings = await settingsCollection.findOne({});
    
    if (!settings) {
      console.log("No settings found");
      return;
    }
    
    let updated = false;
    const updates = {};
    
    // Migrate logo if it's base64
    if (settings.logo && settings.logo.startsWith('data:image/')) {
      console.log("Migrating logo to Cloudinary...");
      try {
        const logoResult = await uploadToCloudinary(
          settings.logo,
          "sainandhini/brand",
          "logo"
        );
        updates.logo = logoResult.secure_url;
        updates.logoCloudinaryId = logoResult.public_id;
        console.log(`✅ Logo migrated: ${logoResult.bytes} bytes → ${logoResult.secure_url}`);
        updated = true;
      } catch (error) {
        console.error("❌ Failed to migrate logo:", error.message);
      }
    }
    
    // Migrate favicon if it's base64
    if (settings.favicon && settings.favicon.startsWith('data:image/')) {
      console.log("Migrating favicon to Cloudinary...");
      try {
        const faviconResult = await uploadToCloudinary(
          settings.favicon,
          "sainandhini/brand",
          "favicon"
        );
        updates.favicon = faviconResult.secure_url;
        updates.faviconCloudinaryId = faviconResult.public_id;
        console.log(`✅ Favicon migrated: ${faviconResult.bytes} bytes → ${faviconResult.secure_url}`);
        updated = true;
      } catch (error) {
        console.error("❌ Failed to migrate favicon:", error.message);
      }
    }
    
    // Update settings if any images were migrated
    if (updated) {
      await settingsCollection.updateOne({}, { $set: updates });
      console.log("✅ Settings updated in database");
      
      // Calculate size reduction
      const originalLogoSize = settings.logo ? settings.logo.length : 0;
      const originalFaviconSize = settings.favicon ? settings.favicon.length : 0;
      const totalOriginalSize = originalLogoSize + originalFaviconSize;
      const newSize = JSON.stringify(updates).length;
      
      console.log("\n📊 Migration Results:");
      console.log(`Original size: ${Math.round(totalOriginalSize / 1024)} KB`);
      console.log(`New size: ${Math.round(newSize / 1024)} KB`);
      console.log(`Size reduction: ${Math.round(((totalOriginalSize - newSize) / totalOriginalSize) * 100)}%`);
    } else {
      console.log("No base64 images found to migrate");
    }
    
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.close();
  }
}

// Run migration
migrateSettings().catch(console.error);