import Settings from "../models/Settings.js";
import { encryptPassword, decryptPassword } from "../utils/encryption.js";
import { v2 as cloudinary } from "cloudinary";
import Razorpay from "razorpay";
import cache from "../utils/cache.js";

const MASKED = "********";
const SETTINGS_CACHE_KEY = "app_settings";
const SETTINGS_CACHE_TTL = 300; // 5 minutes

const uploadToCloudinary = async (base64Image, folder) => {
    try {
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: folder,
        });
        return { secure_url: result.secure_url, public_id: result.public_id };
    } catch (error) {
        throw new Error("Failed to upload image to Cloudinary");
    }
};

export const getSettings = async (req, res) => {
    try {
        // Check cache first
        const cachedSettings = cache.get(SETTINGS_CACHE_KEY);
        if (cachedSettings) {
            console.log("Settings served from cache");
            return res.json(cachedSettings);
        }

        // Try to fetch settings with extended timeout and retries
        let settings = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (!settings && attempts < maxAttempts) {
            attempts++;
            try {
                console.log(`Fetching settings from DB (attempt ${attempts}/${maxAttempts})...`);
                settings = await Settings.findOne().lean().maxTimeMS(15000);
                
                if (settings) {
                    console.log("Settings fetched successfully from DB");
                    break;
                }
            } catch (err) {
                console.error(`Settings fetch attempt ${attempts} failed:`, err.message);
                if (attempts < maxAttempts) {
                    // Wait a bit before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        if (settings) {
            const masked = { ...settings };

            // Masking secrets for public consumption
            if (masked.payment?.razorpayKeySecret) masked.payment.razorpayKeySecret = MASKED;
            if (masked.payment?.razorpayWebhookSecret) masked.payment.razorpayWebhookSecret = MASKED;
            if (masked.smtp?.password) masked.smtp.password = MASKED;
            if (masked.googleMyBusiness?.apiKey) masked.googleMyBusiness.apiKey = MASKED;

            // Cache the masked settings
            cache.set(SETTINGS_CACHE_KEY, masked, SETTINGS_CACHE_TTL);
            console.log("Settings cached for", SETTINGS_CACHE_TTL, "seconds");

            return res.json(masked);
        }

        // If all attempts failed, return error instead of fallback
        console.error("Failed to fetch settings after all attempts");
        return res.status(503).json({ 
            error: "Unable to fetch settings from database. Please try again.",
            fallback: {
                shopName: "Sai Nandhini Tasty World",
                contactEmail: "info@sainandhini.com",
                contactPhone: "+91 96009 16065",
                logo: ""
            }
        });
    } catch (error) {
        console.error("Error in getSettings:", error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Update Admin Settings
// @route   POST or PUT /api/admin/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
    try {
        let data;

        // Express with body-parser parses JSON, if form-data we would use multer. 
        // Assuming JSON is sent from frontend with base64 for logo/favicon based on our previous translations.
        if (req.body.data && typeof req.body.data === 'string') {
            data = JSON.parse(req.body.data);
        } else {
            data = req.body;
        }

        if (data.logoBase64) {
            const result = await uploadToCloudinary(data.logoBase64, "sainandhini/brand");
            data.logo = result.secure_url;
            delete data.logoBase64;
        }

        if (data.faviconBase64) {
            const result = await uploadToCloudinary(data.faviconBase64, "sainandhini/brand");
            data.favicon = result.secure_url;
            delete data.faviconBase64;
        }

        const existing = await Settings.findOne();
        let razorpayCredentialsChanged = false;

        if (data.payment?.razorpayKeySecret) {
            if (data.payment.razorpayKeySecret === MASKED) {
                data.payment.razorpayKeySecret = existing?.payment?.razorpayKeySecret;
            } else {
                razorpayCredentialsChanged = true;
                data.payment.razorpayKeySecret = encryptPassword(data.payment.razorpayKeySecret);
            }
        }

        if (data.payment?.razorpayWebhookSecret) {
            if (data.payment.razorpayWebhookSecret === MASKED) {
                data.payment.razorpayWebhookSecret = existing?.payment?.razorpayWebhookSecret;
            } else {
                data.payment.razorpayWebhookSecret = encryptPassword(data.payment.razorpayWebhookSecret);
            }
        }

        if (razorpayCredentialsChanged && data.payment?.razorpayKeyId && data.payment?.razorpayKeySecret) {
            try {
                const testSecret = decryptPassword(data.payment.razorpayKeySecret);
                const instance = new Razorpay({
                    key_id: data.payment.razorpayKeyId,
                    key_secret: testSecret,
                });
                await instance.orders.all({ count: 1 });
            } catch (rzpError) {
                return res.status(400).json({ error: "Invalid Razorpay credentials. Connection test failed." });
            }
        }

        if (data.smtp?.password) {
            if (data.smtp.password === MASKED) {
                data.smtp.password = existing?.smtp?.password;
            } else {
                data.smtp.password = encryptPassword(data.smtp.password);
            }
        }

        if (data.googleMyBusiness?.apiKey) {
            if (data.googleMyBusiness.apiKey === MASKED) {
                data.googleMyBusiness.apiKey = existing?.googleMyBusiness?.apiKey;
            } else {
                data.googleMyBusiness.apiKey = encryptPassword(data.googleMyBusiness.apiKey);
            }
        }

        const settings = await Settings.findOneAndUpdate({}, data, {
            returnDocument: "after",
            upsert: true,
            new: true,
        });

        // Clear cache when settings are updated
        cache.delete(SETTINGS_CACHE_KEY);
        
        // Also clear Next.js cache if available
        try {
            const { clearSettingsCache } = await import("../../../src/lib/settings-cache.js");
            clearSettingsCache();
        } catch (e) {
            // Ignore if frontend cache is not available
        }
        
        console.log("Settings cache cleared after update");

        const response = settings.toObject();
        if (response.payment?.razorpayKeySecret) response.payment.razorpayKeySecret = MASKED;
        if (response.payment?.razorpayWebhookSecret) response.payment.razorpayWebhookSecret = MASKED;
        if (response.smtp?.password) response.smtp.password = MASKED;
        if (response.googleMyBusiness?.apiKey) response.googleMyBusiness.apiKey = MASKED;

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
