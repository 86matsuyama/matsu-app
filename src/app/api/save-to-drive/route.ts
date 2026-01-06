import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFileToDrive } from "@/lib/drive";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        // @ts-ignore - Access token from session
        const accessToken = session.accessToken;

        if (!accessToken) {
            return NextResponse.json(
                { error: "アクセストークンが見つかりません。再ログインしてください。" },
                { status: 401 }
            );
        }

        const { content, userName } = await request.json();

        if (!content || !userName) {
            return NextResponse.json(
                { error: "必要なデータが不足しています" },
                { status: 400 }
            );
        }

        // Generate filename: YYYY-MM-DD_{User_Name}_reflection.md
        const now = new Date();
        const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
        const sanitizedName = userName.replace(/\s+/g, "_");
        const fileName = `${dateStr}_${sanitizedName}_reflection.md`;

        // Upload to Google Drive using user's access token
        console.log('[DRIVE] Starting upload...');
        console.log('[DRIVE] File name:', fileName);
        console.log('[DRIVE] Folder ID:', env.GOOGLE_DRIVE_FOLDER_ID);
        console.log('[DRIVE] Has access token:', !!accessToken);

        const result = await uploadFileToDrive(
            accessToken,
            fileName,
            content,
            env.GOOGLE_DRIVE_FOLDER_ID
        );

        console.log('[DRIVE] Upload successful:', result);

        return NextResponse.json({
            success: true,
            fileId: result.id,
            fileName: result.name,
            webViewLink: result.webViewLink,
        });
    } catch (error: any) {
        console.error("Error saving to Drive:", error);
        return NextResponse.json(
            { error: "Google Driveへの保存中にエラーが発生しました", details: error.message },
            { status: 500 }
        );
    }
}
