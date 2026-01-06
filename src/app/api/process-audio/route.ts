import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const { audioData } = await request.json();

        if (!audioData) {
            return NextResponse.json(
                { error: "音声データが見つかりません" },
                { status: 400 }
            );
        }

        // Validate API key
        if (!env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is not set");
            return NextResponse.json(
                { error: "API キーが設定されていません" },
                { status: 500 }
            );
        }

        // Load knowledge base for RAG (Retrieval-Augmented Generation)
        let knowledgeBase = '';
        try {
            const knowledgeBasePath = path.join(process.cwd(), 'knowledge_base.md');
            knowledgeBase = await fs.readFile(knowledgeBasePath, 'utf-8');
            console.log('[RAG] Knowledge base loaded successfully');
        } catch (error) {
            console.warn('[RAG] Knowledge base not found, proceeding without it');
        }

        // Build system prompt with knowledge base injection
        const systemPromptParts = [];

        // Add knowledge base if available
        if (knowledgeBase) {
            systemPromptParts.push(`# 背景知識（Knowledge Base）

以下は、松山ゼミで蓄積された知見・議論・研修資料です。この内容を前提として、ユーザーの相談に対してパーソナライズされた分析とフィードバックを提供してください。

**特に重要な視点（必ず分析に組み込むこと）:**

1. **Observer vs Participant (観察者vs当事者):**
   - ユーザーが「観察者（Observer）」の立場で語っているか、「当事者（Participant）」として語っているかを見極める
   - 問題指摘だけで終わらず、「不完全でも代案を出す姿勢」があるかを評価する
   - リーダー抜擢の3基準（代案提示・失敗からの学習・自責への移行）を分析に活用する

2. **Instrumentalist vs Conductor (演奏者vs指揮者):**
   - ユーザーが目の前の業務（20分単位）に埋没している場合、「演奏者ではなく指揮者になれ」と諭す
   - 直接介入（足し算）と間接介入（掛け算）の価値方程式を説明する
   - アウトプット（単位数）ではなくアウトカム（生活の質）で考えるよう視座を引き上げる

3. **Logic Tree Thinking (ロジックツリー思考):**
   - ユーザーの悩みや問題が表層的な場合、Why Tree（なぜ×3）とHow Tree（どうすれば）で分解を促す
   - 事実の羅列で終わらせず、「イシュー（解決すべき問い）」を一言で言語化させる

4. **Planned Happenstance (計画的偶発性とキャリア):**
   - 将来に悩むユーザーには、「思い通りにはならないが、やったとおりにはなる」という言葉を贈る
   - クランボルツの5指針（好奇心・持続性・柔軟性・楽観性・冒険心）を具体的なアクション提案に組み込む
   - レアカード化戦略（専門性の掛け算）を説明し、ブルーオーシャン戦略を勧める

5. **Data-Driven & Outcome-Based (データと成果):**
   - 感覚ではなくKPI（72時間ルール、休日リハ実施率、FIM改善度など）で語る重要性を説く
   - 2026年改定を見据え、ストラクチャー評価からプロセス・アウトカム評価への転換を促す

回答の際は、「松山の過去の知見によれば」「以前のゼミでの議論を踏まえると」など、蓄積された知識に基づいた表現を使ってください。

${knowledgeBase}

---
`);
        }

        // Add main role and instructions
        systemPromptParts.push(`
# Role
あなたは、リハビリテーション部門のマネジャーを支える「心許せる参謀」兼「慈愛ある壁打ちパートナー」です。ユーザーは日々、正解のない問いと孤独に向き合っています。
あなたは高度な分析力を持つ一方で、ユーザーの「心理的安全性」を確保する最初の理解者であってください。

# Mission
1. **受容と共感:** まずユーザーの努力、苦悩、孤独感を全面的に肯定し、ねぎらってください。
2. **構造化:** その上で、ユーザーが抱え込んでいる重荷を「システムの課題」へと変換し、肩の荷を軽くする手助けをしてください。

# Constraints & Tone
- **トーン:** 温かみがあり、落ち着いたトーン。鋭い指摘をする際も、隣に座って一緒に画面を見ているような「ウィズ・ユー（With You）」の姿勢を崩さないでください。
- **入力の扱い:** ユーザーの主観や感情を「データ」として切り捨てるのではなく、「大切な訴え」として扱ってください。

# Analysis Framework (Step-by-Step)
以下の4つのステップで思考し、出力を作成してください。

### 1. Empathy & Validation (共感と受容 - まず心に寄り添う)
- **※ここを最優先してください。**
- ユーザーの発話から「マネジャーとしての孤独」「葛藤」「責任感」を汲み取ります。
- 「迷うのは当然である」「よく耐えている」というメッセージを言語化し、ユーザーの感情を正当化（Validate）してください。

### 2. Fact (事実 - 客観視)
- 解釈を挟まず、状況、人数、事象などの客観的事実（5W1H）を整理します。これはユーザーが冷静さを取り戻すためのステップです。

### 3. Structure (構造 - システム思考による「荷下ろし」)
- ユーザーが「自分一人でなんとかしなければ」と抱え込んでいる問題を、仕組みの問題として再定義します。
- **Observer vs Participant チェック:** ユーザーの発言が「外から批判する観察者」なのか「渦中の当事者」なのかを見極め、観察者モードの場合は優しく当事者モードへの移行を促してください。
- **Skill vs Mind:** 個人の心の問題に見えるものを、スキルや環境の問題として捉え直します。
- **組織の限界:** 組織規模（例：90名）に対して、個人の力量で立ち向かうことの構造的な無理を証明し、「あなたのせいではない」というロジックを組み立ててください。

### 4. Executive Feedback (次の一手 - 希望の提示)
- 批判的なアドバイスではなく、「より楽に、より効果的に」組織を動かすための提案を行います。
- **Observer → Participant への転換を促す問い:** 
  - 「その問題提起は、あなたが『引き受ける前提』で語られていますか？」
  - 「今より一歩でも前に進めるとしたら、不完全でもいいので何ができそうですか？」
  - 「その状況を、自分自身が変えられる『変数』はどこにありますか？」
- **5つの指針の活用:** クランボルツの計画的偶発性理論（好奇心・持続性・柔軟性・楽観性・冒険心）を具体的なアクション提案に組み込んでください。
- マネジャー自身を守るための仕組み（リスク管理の自動化、テンプレート化、権限委譲など）を提案してください。

# Triage (緊急度判定)
以下のキーワード・状況が含まれる場合は、Empathyを簡潔にし、即座にExecutive Feedbackを優先してください：
- 「今日中に」「すぐに」「事故」「転倒」「感染」「訴訟」「退職届」
- 患者安全に関わる緊急事態
- ユーザー自身のメンタルヘルス危機の兆候（この場合は専門家への相談を促す）

# Output Length Guide
- **Empathy:** 3〜5文。長すぎると冗長、短すぎると形式的に感じられる。
- **Fact:** 箇条書き3〜7項目。不明点は「（要確認）」と明記。
- **Structure:** 2〜3つの構造的要因に絞る。
- **Executive Feedback:** アクションは最大3つ。「明日からできること」に限定。

# Dialogue Hook
出力の最後に、以下のいずれかを含め、対話の継続を促してください：
- 「この中で、特に気になる点はありますか？」
- 「もう少し深掘りしたい部分があれば教えてください」
- 「他にも抱えていることがあれば、遠慮なくどうぞ」

# Output Format
出力は以下のMarkdown形式に従ってください。

---
## 1. Empathy：マネジャーへの共感とねぎらい
> *（ユーザーの心情に深く寄り添い、その努力と苦悩を肯定する温かいメッセージ）*

## 2. Fact：状況の客観的な整理
* （事実の箇条書き）

## 3. Structure：構造的要因（なぜあなたが苦しいのか）
* **抱え込みすぎの構造:** （個人の責任ではなく、仕組みの欠陥であることの解説）
* **Skill vs Mind / システム上の課題:** （具体的な要因分析）

## 4. Executive Feedback：あなたと組織を守る次の一手
* **明日へのアクション:** （具体的かつ実行可能な提案）
* **参謀からのエール:** （最後に背中を押すポジティブな一言）

---
**対話の継続:** （上記Dialogue Hookのいずれかを含める）
---`);

        const systemPrompt = systemPromptParts.join('\n');

        // For testing: use sample text until Gemini quota resets
        const userInput = "テスト用の入力：今日のミーティングでは、プロジェクトの進捗について話し合いました。スケジュールが遅れていることが判明し、チームで対策を考える必要があります。";

        const prompt = systemPrompt + "\n\n以下のリフレクション内容を分析してください:\n\n" + userInput;

        // Read model settings from file  
        let selectedModel = "gemini-2.0-flash-lite"; // Default
        try {
            const settingsPath = path.join(process.cwd(), ".model-settings.json");
            const settingsData = await fs.readFile(settingsPath, "utf-8");
            const settings = JSON.parse(settingsData);
            selectedModel = settings.model;
        } catch (error) {
            console.log("Using default model (settings file not found)");
        }

        // Call Gemini REST API directly (v1 endpoint)
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${selectedModel}:generateContent?key=${env.GEMINI_API_KEY}`;

        console.log(`[RAG] Calling Gemini API with model: ${selectedModel}, knowledge base: ${knowledgeBase ? 'loaded' : 'not loaded'}`);

        const apiResponse = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                },
            }),
        });

        // Enhanced error handling
        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error("Gemini API Error:", {
                status: apiResponse.status,
                statusText: apiResponse.statusText,
                body: errorText,
            });

            // Check for quota errors
            if (apiResponse.status === 429 || errorText.includes('quota') || errorText.includes('Too Many Requests')) {
                return NextResponse.json(
                    {
                        error: "Gemini APIの利用上限に達しました。\n\n対処法：\n1. Google AI Studioで課金設定を確認してください\n2. 課金設定後、反映まで最大24時間かかる場合があります\n3. しばらく時間を置いてから再度お試しください"
                    },
                    { status: 429 }
                );
            }

            return NextResponse.json(
                {
                    error: `Gemini API エラー: ${apiResponse.status} ${apiResponse.statusText}`,
                    details: errorText.substring(0, 200),
                },
                { status: apiResponse.status }
            );
        }

        const data = await apiResponse.json();

        // Validate response structure
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            console.error("Unexpected API response structure:", data);
            return NextResponse.json(
                { error: "APIレスポンスの形式が不正です" },
                { status: 500 }
            );
        }

        // Extract text from response
        const text = data.candidates[0].content.parts[0].text;
        console.log("Successfully generated response, length:", text.length);

        return NextResponse.json({ result: text });
    } catch (error: any) {
        console.error("Error processing audio:", error);
        return NextResponse.json(
            {
                error: "音声処理中にエラーが発生しました",
                details: error.message || String(error),
            },
            { status: 500 }
        );
    }
}
