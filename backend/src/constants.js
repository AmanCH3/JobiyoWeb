export const DB_NAME = "jobiyo";

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' for cross-site cookie if frontend/backend distinct, 'lax' for local
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
};
