import mongoose from "mongoose";
import Settings from "./models/Settings.js";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sainandhini";

async function testSettingsLogo() {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected successfully!");

        console.log("\nFetching settings...");
        const settings = await Settings.findOne().lean();

        if (!settings) {
            console.log("❌ No settings found in database");
            return;
        }

        console.log("\n✅ Settings found!");
        console.log("Shop Name:", settings.shopName);
        console.log("Contact Email:", settings.contactEmail);
        console.log("Contact Phone:", settings.contactPhone);
        console.log("\nLogo field:");
        console.log("  - Exists:", "logo" in settings);
        console.log("  - Value:", settings.logo);
        console.log("  - Type:", typeof settings.logo);
        console.log("  - Length:", settings.logo?.length || 0);
        console.log("  - Is Empty:", !settings.logo || settings.logo === "");

        if (settings.logo) {
            console.log("\n✅ Logo data IS present in database!");
            console.log("Logo URL:", settings.logo);
        } else {
            console.log("\n❌ Logo field is empty in database");
        }

        // Check all fields
        console.log("\n\nAll settings fields:");
        console.log(JSON.stringify(settings, null, 2));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.connection.close();
        console.log("\nDatabase connection closed");
    }
}

testSettingsLogo();
