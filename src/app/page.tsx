"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import VoiceRecorder from "@/components/VoiceRecorder";
import { useState } from "react";
import { LogOut, Settings, AudioWaveform, Sparkles, Mic2, Brain, Database, X } from "lucide-react";

const ADMIN_EMAIL = "86.matsuyama@gmail.com";

type ModalContent = {
  title: string;
  subtitle: string;
  explanation: string;
  tips: string;
  icon: React.ReactNode;
};

const modalContents: Record<string, ModalContent> = {
  voice: {
    title: "Voice Reflections",
    subtitle: "思考の種を、言葉で残す",
    explanation: "日々の臨床や管理の現場で生まれる「違和感」や「気づき」は、すぐに消えてしまう貴重な思考の種です。",
    tips: "「うまく話そう」とする必要はありません。まずは5W1H（事実）から話し始め、次にその時感じた素直な感情を付け加えてください。独り言のようなとりとめのない話から、AIが重要な文脈を読み取ります。一日の終わりに、自分自身と対話する5分間をルーティンにしてみましょう。",
    icon: <Mic2 className="w-12 h-12 text-amber-400" strokeWidth={2} />,
  },
  ai: {
    title: "AI Feedback",
    subtitle: "視座を高める、AI参謀",
    explanation: "録音された内容は、「MBA×医療マネジメント」の思考フレームを学習したAIが即座に分析します。",
    tips: "「誰が悪いか」という個人レベルの視点を離れ、「なぜその問題が起きる仕組みになっているのか」という構造的な洞察（システム思考）を提示。あなたのメタ認知をサポートし、リーダーとしての次の一手を共に考えます。",
    icon: <Brain className="w-12 h-12 text-amber-400" strokeWidth={2} />,
  },
  knowledge: {
    title: "Knowledge Base",
    subtitle: "経験を、一生の資産に変える",
    explanation: "分析結果はあなたのGoogle Driveに自動で蓄積されます。",
    tips: "一回きりのリフレクションで終わらせず、1ヶ月後、半年後に読み返してみてください。そこには、あなたが乗り越えてきた壁と、着実に変化してきた思考の軌跡が刻まれています。それは、あなたと組織を支える唯一無二のナレッジベース（知識資産）となります。",
    icon: <Database className="w-12 h-12 text-amber-400" strokeWidth={2} />,
  },
};

export default function Home() {
  const { data: session, status } = useSession();
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  const openModal = (modalId: string) => {
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md">
          <div className="text-center space-y-8">
            {/* Glowing Logo */}
            <div className="flex flex-col items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl p-4 border border-amber-500/30 bg-amber-500/10 shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]">
                <AudioWaveform className="h-full w-full text-amber-400" strokeWidth={2.5} />
              </div>
              <div className="font-sans tracking-tight">
                <div className="text-4xl">
                  <span className="font-black text-slate-100">Management</span>
                  {" "}
                  <span className="font-light italic text-slate-400">Reflexion</span>
                </div>
                <p className="text-[10px] tracking-[0.2em] text-slate-500 uppercase mt-3">
                  Transforming Raw Voice Into Structured Knowledge
                </p>
              </div>
            </div>

            {/* Login Button */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <p className="text-slate-400 text-sm mb-4">
                音声録音とAI分析で、マネジメント業務を深く振り返る
              </p>
              <button
                onClick={() => signIn("google")}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 py-4 px-6 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-amber-500/20 flex items-center justify-center space-x-3"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Googleでログイン</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-32">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
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

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <a
                href="/settings"
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                title="管理者設定"
              >
                <Settings className="w-6 h-6 text-slate-400 hover:text-amber-400" />
              </a>
            )}
            <button
              onClick={() => signOut()}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title="ログアウト"
            >
              <LogOut className="w-6 h-6 text-slate-400 hover:text-amber-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <div className="max-w-6xl mx-auto mt-8 md:mt-12 px-4">
        {/* Welcome Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
            Welcome back, {session.user?.name}
          </h1>
          <p className="text-sm md:text-base text-slate-300">あなたの戦略的思考を記録・分析・蓄積する場所</p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {/* Voice Reflections Card */}
          <button
            onClick={() => openModal('voice')}
            className="bg-slate-800 border border-slate-700 hover:border-slate-600 hover:bg-slate-700/80 transition-all duration-300 rounded-xl p-4 md:p-6 cursor-pointer text-left w-full"
          >
            <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
              <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Mic2 className="w-8 h-8 text-amber-400" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">Voice Reflections</h3>
                <p className="text-sm text-slate-400">
                  音声で簡単に記録。あなたの思考を逃さず捉える
                </p>
              </div>
            </div>
          </button>

          {/* AI Feedback Card */}
          <button
            onClick={() => openModal('ai')}
            className="bg-slate-800 border border-slate-700 hover:border-slate-600 hover:bg-slate-700/80 transition-all duration-300 rounded-xl p-4 md:p-6 cursor-pointer text-left w-full"
          >
            <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
              <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Brain className="w-8 h-8 text-amber-400" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">AI Feedback</h3>
                <p className="text-sm text-slate-400">
                  AIがシステム思考で分析。構造的な洞察を提供
                </p>
              </div>
            </div>
          </button>

          {/* Knowledge Base Card */}
          <button
            onClick={() => openModal('knowledge')}
            className="bg-slate-800 border border-slate-700 hover:border-slate-600 hover:bg-slate-700/80 transition-all duration-300 rounded-xl p-4 md:p-6 cursor-pointer text-left w-full"
          >
            <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
              <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Database className="w-8 h-8 text-amber-400" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">Knowledge Base</h3>
                <p className="text-sm text-slate-400">
                  Google Driveに自動保存。知識資産として蓄積
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Voice Recorder - Bottom Fixed Bar */}
        <VoiceRecorder
          userName={session.user?.name || ""}
          onAnalysisComplete={(result) => setAnalysisResult(result)}
        />

        {/* Analysis Result Card */}
        {analysisResult && (
          <div className="mt-6 mb-24 bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-slate-100">AI分析結果</h2>
            </div>
            <div
              className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: analysisResult
                  .replace(/\n/g, "<br/>")
                  .replace(/\*\*(.*?)\*\*/g, "<strong class='text-slate-100'>$1</strong>")
                  .replace(/\*(.*?)\*/g, "<em>$1</em>")
                  .replace(/^## (.*?)$/gm, "<h3 class='text-base font-bold mt-4 mb-2 text-slate-100'>$1</h3>")
                  .replace(/^# (.*?)$/gm, "<h2 class='text-lg font-bold mt-6 mb-3 text-slate-100'>$1</h2>"),
              }}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {activeModal && modalContents[activeModal] && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                    {modalContents[activeModal].icon}
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {modalContents[activeModal].title}
                    </h2>
                    <p className="text-lg md:text-xl text-amber-400 font-medium">
                      {modalContents[activeModal].subtitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-200 mb-3">解説</h3>
                  <p className="text-base md:text-lg text-slate-300 leading-relaxed">
                    {modalContents[activeModal].explanation}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-200 mb-3">使い方のコツ</h3>
                  <p className="text-base md:text-lg text-slate-300 leading-relaxed">
                    {modalContents[activeModal].tips}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-8">
                <button
                  onClick={closeModal}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 py-4 px-6 rounded-xl font-bold text-lg transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
