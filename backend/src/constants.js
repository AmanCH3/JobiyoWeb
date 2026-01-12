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

// Promotion Plans Configuration
// Validate input against these keys.
export const PROMOTION_PLANS = {
    FEATURED_7D: {
        type: "FEATURED",
        durationDays: 7,
        amountCents: 4900, // $49.00
        currency: "usd",
        boostScore: 10,
        pinEnabled: false,
        homepageBoost: true,
        emailBoost: true,
    },
    FEATURED_30D: {
        type: "FEATURED",
        durationDays: 30,
        amountCents: 14900, // $149.00
        currency: "usd",
        boostScore: 15,
        pinEnabled: false,
        homepageBoost: true,
        emailBoost: true,
    },
    PROMOTED_7D: {
        type: "PROMOTED",
        durationDays: 7,
        amountCents: 9900, // $99.00
        currency: "usd",
        boostScore: 50,
        pinEnabled: true,
        homepageBoost: true,
        emailBoost: true,
    },
    PROMOTED_30D: {
        type: "PROMOTED",
        durationDays: 30,
        amountCents: 29900, // $299.00
        currency: "usd",
        boostScore: 60,
        pinEnabled: true,
        homepageBoost: true,
        emailBoost: true,
    }
};
