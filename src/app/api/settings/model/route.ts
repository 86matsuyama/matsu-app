import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

const ADMIN_EMAIL = "86.matsuyama@gmail.com";
const SETTINGS_FILE = path.join(process.cwd(), ".model-settings.json");

type ModelSettings = {
    model: "gemini-2.5-pro" | "gemini-2.5-flash" | "gemini-2.0-flash-lite";
    updatedAt: string;
    updatedBy: string;
};

async function readSettings(): Promise<ModelSettings> {
    try {
        const data = await fs.readFile(SETTINGS_FILE, "utf-8");
        return JSON.parse(data);
    } catch {
        // Default settings
        return {
            model: "gemini-2.0-flash-lite",
            updatedAt: new Date().toISOString(),
            updatedBy: "system",
        };
    }
}

async function writeSettings(settings: ModelSettings): Promise<void> {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

// GET: Retrieve current model settings
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        // Only admin can view settings
        if (session.user.email !== ADMIN_EMAIL) {
            return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
        }

        const settings = await readSettings();
        return NextResponse.json(settings);
    } catch (error: any) {
        console.error("Error reading model settings:", error);
        return NextResponse.json(
            { error: "設定の読み込みに失敗しました", details: error.message },
            { status: 500 }
        );
    }
}

// POST: Update model settings (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        // Only admin can update settings
        if (session.user.email !== ADMIN_EMAIL) {
            return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
        }

        const { model } = await request.json();

        if (!model || !["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash-lite"].includes(model)) {
            return NextResponse.json(
                { error: "無効なモデル名です" },
                { status: 400 }
            );
        }

        const settings: ModelSettings = {
            model,
            updatedAt: new Date().toISOString(),
            updatedBy: session.user.email || "unknown",
        };

        await writeSettings(settings);

        return NextResponse.json({ success: true, settings });
    } catch (error: any) {
        console.error("Error updating model settings:", error);
        return NextResponse.json(
            { error: "設定の更新に失敗しました", details: error.message },
            { status: 500 }
        );
    }
}
