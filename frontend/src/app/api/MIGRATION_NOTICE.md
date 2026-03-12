/**
 * IMPORTANT: The Next.js API routes in src/app/api have all been migrated
 * to the Express backend (backend/server.js running on port 5000).
 * 
 * Next.js rewrites in next.config.mjs forward:
 *   /api/* → http://localhost:5000/api/*
 * 
 * However, Next.js rewrites do NOT apply when a matching route.ts handler
 * exists in app/api. To use the Express backend for all API calls, the 
 * old Next.js route handlers should be removed.
 * 
 * MIGRATION STATUS: All 46 route files have been ported to Express.
 * Safe to delete the entire src/app/api directory.
 */
