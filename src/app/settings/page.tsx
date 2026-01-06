"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Settings, Check, Loader2, ArrowLeft, AudioWaveform, AlertCircle } from "lucide-react";

const ADMIN_EMAIL = "86.matsuyama@gmail.com";

type ModelOption = {
    id: "gemini-2.5-pro" | "gemini-2.5-flash" | "gemini-2.0-flash-lite";
    name: string;
    description: string;
};

const models: ModelOption[] = [
    {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        description: "最高性能・最も高度な分析",
    },
    {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        description: "高速・バランス型（推奨）",
    },
    {
        id: "gemini-2.0-flash-lite",
        name: "Gemini 2.0 Flash Lite",
        description: "軽量・高速応答・制限緩い",
    },
];

export default function SettingsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [currentModel, setCurrentModel] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const isAdmin = session?.user?.email === ADMIN_EMAIL;

    useEffect(() => {
        if (!session) return;
        if (!isAdmin) {
            router.push("/");
            return;
        }
        fetchCurrentModel();
    }, [session, isAdmin, router]);

    const fetchCurrentModel = async () => {
        try {
            const response = await fetch("/api/settings/model");
            if (response.ok) {
                const data = await response.json();
                setCurrentModel(data.model);
            }
        } catch (error) {
            console.error("Failed to fetch model settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleModelChange = async (modelId: string) => {
        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch("/api/settings/model", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: modelId }),
            });

            if (response.ok) {
                setCurrentModel(modelId);
                setMessage({ type: "success", text: "モデルを変更しました" });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: "error", text: "モデルの変更に失敗しました" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "エラーが発生しました" });
        } finally {
            setSaving(false);
        }
    };

    if (!session || !isAdmin) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-slate-400">アクセス権限がありません</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Sticky Header */}
            <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg p-2 border border-amber-500/30 bg-amber-500/10">
                            <AudioWaveform className="h-full w-full text-amber-400" strokeWidth={2.5} />
                        </div>
                        <div className="font-sans tracking-tight">
                            <span className="font-black text-slate-100 text-xl">Management</span>
                            {" "}
                            <span className="font-light italic text-slate-400 text-xl">Reflexion</span>
                        </div>
                    </div>
                    <a
                        href="/"
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-400 hover:text-amber-400" />
                    </a>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-6">
                        <Settings className="w-5 h-5 text-amber-400" />
                        <h2 className="text-lg font-bold text-slate-100">Gemini モデル選択</h2>
                    </div>

                    <p className="text-sm text-slate-400 mb-6">
                        全ユーザーの分析に使用するGeminiモデルを選択してください
                    </p>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {models.map((model) => (
                                <button
                                    key={model.id}
                                    onClick={() => handleModelChange(model.id)}
                                    disabled={saving}
                                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${currentModel === model.id
                                        ? "border-amber-500 bg-amber-500/10"
                                        : "border-slate-700 hover:border-slate-600 bg-slate-800/50"
                                        } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-100">{model.name}</h3>
                                            <p className="text-sm text-slate-400 mt-1">{model.description}</p>
                                        </div>
                                        {currentModel === model.id && (
                                            <div className="ml-4">
                                                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-slate-950" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {message && (
                        <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${message.type === "success"
                            ? "bg-green-500/10 border border-green-500/30"
                            : "bg-red-500/10 border border-red-500/30"
                            }`}>
                            {message.type === "success" ? (
                                <Check className="w-4 h-4 text-green-400" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-red-400" />
                            )}
                            <p className={`text-sm ${message.type === "success" ? "text-green-300" : "text-red-300"
                                }`}>
                                {message.text}
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
