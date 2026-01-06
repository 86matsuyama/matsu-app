"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function TestDrivePage() {
    const { data: session } = useSession();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testDriveSave = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch("/api/save-to-drive", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: `# マネジメント・リフレクション分析結果（テスト）

日時: ${new Date().toLocaleString("ja-JP")}
ユーザー: ${session?.user?.name || "テストユーザー"}

## 【事実】
- 本日、ミーティングが開催された
- プロジェクトの進捗状況について議論
- スケジュール遅延が判明

## 【感情】
- チームの懸念と責任感
- 問題解決への意欲

## 【構造】
1. 現状認識
2. 課題の特定
3. 対策の検討

## マネジメント視点でのフィードバック
このテストファイルはGoogle Drive保存機能の動作確認用です。
`,
                    userName: session?.user?.name || "TestUser",
                }),
            });

            const data = await response.json();
            setResult(data);
        } catch (error: any) {
            setResult({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                <div className="text-white text-center">
                    <h1 className="text-2xl font-bold mb-4">ログインが必要です</h1>
                    <p>トップページからログインしてください</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">
                    Google Drive 保存テスト
                </h1>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
                    <p className="text-white mb-4">
                        ログイン中: <strong>{session.user?.name}</strong>
                    </p>
                    <p className="text-white/80 text-sm mb-6">
                        このボタンをクリックすると、ダミーの分析結果をGoogle Driveに保存します。
                    </p>

                    <button
                        onClick={testDriveSave}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "保存中..." : "Google Driveに保存テスト"}
                    </button>
                </div>

                {result && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">結果:</h2>
                        <pre className="bg-black/30 p-4 rounded-lg text-green-400 text-sm overflow-auto">
                            {JSON.stringify(result, null, 2)}
                        </pre>

                        {result.webViewLink && (
                            <a
                                href={result.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Google Driveで開く →
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
