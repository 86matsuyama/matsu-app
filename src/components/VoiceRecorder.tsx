"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Send, Loader2, Check, AlertCircle } from "lucide-react";

interface VoiceRecorderProps {
  userName: string;
  onAnalysisComplete: (result: string) => void;
}

export default function VoiceRecorder({ userName, onAnalysisComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      const updateAudioLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
        }
        animationRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setAudioLevel(0);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
  // Reset all states before starting new recording
  setError(null);
  setSuccess(null);
  setAudioURL(null);
  setRecordingTime(0);
  audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError("マイクへのアクセスが拒否されました");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnalyze = async () => {
    if (!audioURL) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/process-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioData: audioURL }),
      });
      if (!response.ok) {
       const errorData = await response.json();
  console.error("API Error:", errorData);
  const errorMessage = errorData.error || errorData.details || "AI処理に失敗しました";
  throw new Error(errorMessage);
      }
      const data = await response.json();
      onAnalysisComplete(data.result);
      setIsSaving(true);
      const saveResponse = await fetch("/api/save-to-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: data.result,
          userName: userName,
        }),
      });
      if (saveResponse.ok) {
        const saveData = await saveResponse.json();
        setSuccess(`分析完了！Google Driveに保存しました: ${saveData.fileName}`);
      } else {
    const saveError = await saveResponse.json();
    console.error("Save Error:", saveError);
    throw new Error(saveError.error || "Google Driveへの保存に失敗しました");
  }
  } catch (err: any) {
    console.error("Analysis Error:", err);
      setError(err.message || "エラーが発生しました");
    } finally {
      setIsProcessing(false);
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 p-4 z-10">
        <div className="max-w-3xl mx-auto">
          {/* Recording Status - shown above buttons when recording */}
          {isRecording && (
            <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-recording-pulse"></div>
                  <span className="text-base font-semibold text-slate-100">
                    {isPaused ? "一時停止中" : "録音中"}
                  </span>
                </div>
                <span className="text-2xl font-mono font-bold text-slate-100">
                  {formatTime(recordingTime)}
                </span>
              </div>
              <div className="flex items-center space-x-0.5 h-12">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-amber-500 rounded-full transition-all duration-75"
                    style={{
                      height: `${Math.max(8, audioLevel * 100 * (0.5 + Math.random() * 0.5))}%`,
                      opacity: isPaused ? 0.3 : 1,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Audio Preview */}
          {audioURL && !isRecording && (
            <div className="mb-4 p-4 bg-slate-800/50 rounded-xl">
              <p className="text-sm text-slate-400 mb-2">録音プレビュー</p>
              <audio src={audioURL} controls className="w-full" />
            </div>
          )}

          {/* Error Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Success Messages */}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start space-x-2">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-300">{success}</p>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={isProcessing || isSaving}
                className="h-20 px-8 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full flex items-center justify-center gap-3 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 font-bold"
              >
                <Mic className="w-8 h-8" />
                <span className="text-lg">録音開始</span>
              </button>
            ) : (
              <>
                <button
                  onClick={togglePause}
                  className="h-16 px-6 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-full flex items-center gap-2 shadow-md font-semibold"
                >
                  {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                  <span>{isPaused ? "再開" : "一時停止"}</span>
                </button>
                <button
                  onClick={stopRecording}
                  className="h-20 px-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center gap-3 shadow-lg font-bold"
                >
                  <Square className="w-8 h-8" />
                  <span className="text-lg">停止</span>
                </button>
              </>
            )}
            {audioURL && !isRecording && (
              <button
                onClick={handleAnalyze}
                disabled={isProcessing || isSaving}
                className="h-16 px-8 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full flex items-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-50 font-bold"
              >
                {isProcessing || isSaving ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>{isSaving ? "保存中..." : "分析中..."}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    <span>分析して保存</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
