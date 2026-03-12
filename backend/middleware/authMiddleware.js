import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            // Decodes token id
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ error: "Not authorized, user not found" });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ error: "Not authorized, token failed" });
        }
    } else if (req.cookies && req.cookies['better-auth.session_token']) {
        // Handle BetterAuth session token
        try {
            const sessionToken = req.cookies['better-auth.session_token'];
            
            // For BetterAuth, we need to verify the session differently
            // Since BetterAuth manages sessions, we'll query the user from the session
            // This is a simplified approach - you may need to adjust based on your BetterAuth setup
            
            // For now, we'll allow the request to proceed if the session cookie exists
            // You should implement proper session verification here
            
            // Temporary: Allow admin operations if session cookie exists
            // TODO: Implement proper BetterAuth session verification
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ error: "Not authorized, session invalid" });
        }
    } else {
        res.status(401).json({ error: "Not authorized, no token" });
    }
};

export const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else if (req.cookies && req.cookies['better-auth.session_token']) {
        // Temporary: Allow if BetterAuth session exists
        // TODO: Verify admin role from BetterAuth session
        next();
    } else {
        res.status(401).json({ error: "Not authorized as an admin" });
    }
};
