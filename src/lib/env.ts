// Environment variable validation
export const env = {
    // NextAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",

    // Gemini AI
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",

    // Google Drive
    GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID || "",
};

// Validate required environment variables
export function validateEnv() {
    const required = [
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "NEXTAUTH_SECRET",
        "GEMINI_API_KEY",
        "GOOGLE_DRIVE_FOLDER_ID",
    ] as const;

    const missing = required.filter((key) => !env[key]);

    if (missing.length > 0) {
        console.warn(
            `Warning: Missing environment variables: ${missing.join(", ")}`
        );
    }
}
