export const DB_NAME = "jobiyo";

// Cookie Options
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Base options
const BASE_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? "none" : "lax", // 'none' + secure allows cross-site (required for some deployments), 'lax' for local
    path: "/",
};

// Access Token Cookie (Short-lived: 15 minutes) - Represents "Idle Timeout"
export const ACCESS_COOKIE_OPTIONS = {
    ...BASE_COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000 // 15 minutes
};

// Refresh Token Cookie (Long-lived: 7 days) - Represents "Absolute Timeout"
export const REFRESH_COOKIE_OPTIONS = {
    ...BASE_COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Export base for clearing cookies
export const COOKIE_OPTIONS = BASE_COOKIE_OPTIONS;
