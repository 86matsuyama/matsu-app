import { google } from "googleapis";

export async function uploadFileToDrive(
    accessToken: string,
    fileName: string,
    content: string,
    folderId: string,
    mimeType: string = "text/markdown"
) {
    // Initialize Drive client with user's access token
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: "v3", auth });

    const fileMetadata = {
        name: fileName,
        parents: [folderId],
    };

    const media = {
        mimeType,
        body: content,
    };

    const response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: "id, name, webViewLink",
    });

    return response.data;
}
