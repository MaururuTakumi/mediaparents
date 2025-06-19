import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // APIキーの確認
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not set')
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    const { conversation, sessionId, studentType, parentPersona, personaBasedQuestions } = await request.json()

    if (!conversation || conversation.length < 2) {
      return NextResponse.json(
        { error: '十分な会話データがありません' },
        { status: 400 }
      )
    }

    // 会話ログを文字列に変換
    const conversationText = conversation
      .map((msg: any) => `${msg.role === 'user' ? '学生' : 'インタビュアー'}: ${msg.content}`)
      .join('\n\n')

    // 3段階の高品質記事生成プロンプトチェーン
    
    // Step 1: キーポイント抽出
    const keyPointsPrompt = `# 指示
あなたは、インタビュー記事を制作する、超一流の編集アシスタントです。
以下の##対話ログを分析し、指定されたフォーマットでキーポイントを抽出してください。

# 制約
- 事実を客観的に抜き出し、あなたの意見や解釈は含めないでください。
- 各項目は、簡潔かつ具体的に記述してください。
- 出力は、厳密なJSON形式でお願いします。

## 対話ログ
${conversationText}

# 出力フォーマット (JSON)
{
  "summary": "この対話全体の簡潔な要約（200字以内）",
  "emotional_peaks": [
    {
      "emotion": "感情の種類（喜び・達成感、葛藤・苦悩、感謝・気づき等）",
      "episode": "具体的なエピソード"
    }
  ],
  "key_takeaways": [
    "読者にとって価値のある気づき・学び"
  ],
  "symbolic_quotes": [
    "印象的で共感を呼ぶ発言"
  ],
  "target_readers": [
    "想定読者のペルソナ"
  ]
}`

    const keyPointsCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: keyPointsPrompt }],
      max_tokens: 1000,
      temperature: 0.3,
    })

    const keyPointsJson = keyPointsCompletion.choices[0]?.message?.content?.trim() || '{}'
    console.log('Generated key points:', keyPointsJson.substring(0, 200) + '...')

    // Step 2: 構成案生成
    const structurePrompt = `# 指示
あなたは、読者の心を掴む記事構成のプロフェッショナルです。
提供された##キーポイントを基に、読者のエンゲージメントを最大化するための、魅力的な記事構成案を提案してください。

# 制約
- タイトルは、思わずクリックしたくなるような、発見と意外性のあるものにしてください。
- 導入文は、読者を一気に記事の世界に引き込むような、問いかけや印象的なエピソードから始めてください。
- 出力は、厳密なJSON形式でお願いします。

## キーポイント
${keyPointsJson}

# 出力フォーマット (JSON)
{
  "title": "記事タイトル（25-35文字）",
  "excerpt": "記事要約（100-150文字）",
  "lead_text": "導入文（200-300文字）",
  "sections": [
    {
      "heading": "見出し",
      "purpose": "このセクションの目的",
      "key_elements": ["含めるべき要素1", "含めるべき要素2"]
    }
  ],
  "call_to_action": "読者へのメッセージ（100文字以内）"
}`

    const structureCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: structurePrompt }],
      max_tokens: 1500,
      temperature: 0.5,
    })

    const structureJson = structureCompletion.choices[0]?.message?.content?.trim() || '{}'
    console.log('Generated structure:', structureJson.substring(0, 200) + '...')

    let structureData
    let title = 'あなたの体験が誰かの支えになる'
    let excerpt = '実体験から生まれた、同世代への温かいメッセージをお届けします。'

    try {
      structureData = JSON.parse(structureJson)
      title = structureData.title || title
      excerpt = structureData.excerpt || excerpt
    } catch (error) {
      console.error('Structure JSON parse error:', error)
    }

    // Step 3: ペルソナ特化型記事雛形生成
    let contentPrompt = ''
    
    if (studentType && parentPersona) {
      // ペルソナマッチング情報を使用した高度なプロンプト
      contentPrompt = `# あなたの役割
あなたは特定のペルソナペアに最適化された記事雛形を作る専門家です。

# ペルソナマッチング情報
- **学生タイプ**: ${studentType}
- **対象読者**: ${parentPersona}
- **重点質問**: ${personaBasedQuestions ? personaBasedQuestions.join('、') : ''}

# この特定ペルソナの記事要件
このペルソナマッチングに基づいて、以下の特徴を持つ記事雛形を作成してください：

## ペルソナ特化型タイトル戦略
- 対象読者の具体的な悩みに直接響くタイトル
- 学生タイプの体験を活かしたアプローチ
- 「〇〇タイプの私が、〇〇で悩む親御さんに伝えたいこと」形式

## 1. ペルソナ特化型導入（親御さんへの手紙）
【この特定の親ペルソナへの共感から始める】
Q1: この読者ペルソナが抱えている具体的な悩みは？
→ 私も同じような【___________】を経験しました。

Q2: この親ペルソナが最も知りたがっている情報は？
→ 特に【___________】についてお話しします。

【記入例：ペルソナの具体的状況に合わせた導入文】

## 2. ペルソナマッチング型エピソード
【学生タイプの特徴を活かした具体的体験】

### 状況設定（ペルソナの関心に合わせて）
- 親ペルソナが関心を持つ場面：【___________】
- 学生タイプ特有の状況：【___________】
- このペルソナマッチングならではの展開：【___________】

### 親の反応（読者ペルソナの行動パターン）
- 典型的な親の反応：「【___________】」
- この親ペルソナなら言いそうなこと：【___________】

### 私の本音（学生タイプの特徴的な感情）
- このタイプの学生が感じがちなこと：【___________】
- 親ペルソナに理解してほしかったこと：「【___________】」

【記入例：ペルソナマッチングに基づく具体的エピソード3-4段落】

## 3. ペルソナ特化型感謝と要望
【この組み合わせならではの気づき】

### この親ペルソナがしてくれて嬉しかったこと
- 【___________】の配慮
- 「【___________】」という言葉

### この親ペルソナが改善できること
- 【___________】の部分
- でも【___________】という愛情は伝わっていました

### この組み合わせでの理想的関係
- 【___________】な関わり方
- 【___________】というコミュニケーション

## 4. ペルソナ特化型実践アドバイス
【この学生タイプからこの親ペルソナへの具体的提案】

### このタイプの子どもに効果的な接し方
□ 【___________】なアプローチ
□ 【___________】なタイミング
□ 【___________】な言葉選び

### この親ペルソナが避けるべきこと
× 【___________】な対応
× 【___________】な比較
× 【___________】な圧力

### ペルソナマッチング特化の魔法の言葉
「【___________】」
→ このペルソナに効果的な理由：【___________】

## 5. ペルソナマッチング型メッセージ
【この組み合わせならではの希望】
- この親子関係の特別な価値：【___________】
- 改善への具体的ステップ：【___________】
- 理想的な未来像：【___________】

# 対話データ分析
${conversationText}

から以下をペルソナマッチングの視点で抽出してください：
1. 学生タイプ特有の体験や感情
2. 対象親ペルソナが特に知りたがる情報
3. このマッチングならではの気づきやアドバイス
4. ペルソナ特化型の実践的解決策
5. この組み合わせでの理想的親子関係像

**重要**: 穴埋め部分【___________】は残し、記入例はペルソナマッチングに特化した内容で作成してください。`
    } else {
      // フォールバック: 従来のプロンプト
      contentPrompt = `# あなたの役割
あなたは子育てに悩む親たちに共感され、実際に役立つ記事の雛形を作る専門家です。

# 重要な前提
- **読者**: 子育てに悩むお母さん・お父さん（特に中高生〜大学生の子を持つ親）
- **彼らの悩み**: 子どもとのコミュニケーション不足、進路への不安、価値観の違い
- **求めている情報**: 子どもの本音、効果的な関わり方、失敗談と成功談

# 記事雛形の要件
投稿者（学生）が自分の体験を「親に伝わる形」で書けるような、穴埋め式の雛形を作成してください。

# 需要のある記事構成

## タイトル案
「〇〇な時、親に言われて嬉しかった/傷ついた言葉」のような具体的なタイトル

## 1. 親御さんへの手紙（導入）
【以下の質問に答える形で書いてください】
Q1: あなたのお子さんは今、どんなことで悩んでいると思いますか？
→ 実は私も【___________】で悩んでいました。

Q2: その時、親にどう接してほしかったですか？
→ 正直に言うと【___________】してほしかったです。

【記入例】
「お母さん、お父さん。もしかしたら、お子さんも私と同じように〇〇で悩んでいるかもしれません。私の経験が少しでも参考になれば嬉しいです。」

## 2. あの日の出来事（具体的エピソード）
【以下の流れで詳しく書いてください】

### 状況設定
- いつ：【___________】
- どこで：【___________】
- 何があったか：【___________】

### 親の反応
- 親が言った言葉：「【___________】」
- 親の表情や態度：【___________】

### 私の本音
- その時感じたこと：【___________】
- 本当は言いたかったこと：「【___________】」
- なぜ言えなかったか：【___________】

【記入例を含む段落構成】
（ここに対話ログから抽出した具体的な状況を3-4段落で展開）

## 3. 今だから言える親への感謝と要望
【以下の項目を具体的に】

### 嬉しかったこと
- 【___________】してくれた時
- 「【___________】」と言ってくれた時

### 辛かったこと（でも親の愛情は理解している）
- 【___________】された時
- でも今思えば【___________】という気持ちだったんですね

### 理想の関わり方
- こんな風に【___________】してくれたら
- 【___________】という言葉をかけてくれたら

## 4. 親御さんへの実践的アドバイス
【学生の立場から見た、効果的なアプローチ】

### 今すぐできること
□ 【___________】という言葉を使ってみる
□ 【___________】の時は見守る
□ 【___________】について一緒に考える

### 避けてほしいこと
× 【___________】という言い方
× 【___________】と比較すること
× 【___________】を否定すること

### 魔法の言葉
「【___________】」
→ なぜ効果的か：【___________】

## 5. 最後に伝えたいこと
【親子関係の希望】
- 親の愛情は【___________】
- でも表現方法を【___________】
- 一緒に【___________】していきたい

# データから抽出すべき要素
${conversationText}

から以下を抽出して雛形に組み込んでください：
1. 親子間の具体的な衝突や葛藤のエピソード
2. 学生が感じた本音（言えなかった気持ち）
3. 親への要望（こうしてほしかった）
4. 今だから理解できる親の気持ち
5. 他の親御さんへの具体的なアドバイス

**重要**: 穴埋め部分【___________】は残したまま、記入例は対話ログから具体的に作成してください。`
    }

    const contentCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: contentPrompt }],
      max_tokens: 4096,
      temperature: 0.8,
    })

    const content = contentCompletion.choices[0]?.message?.content || 'エラー：記事の生成に失敗しました。'

    // デバッグ：生成された各部分をログ出力
    console.log('=== 記事生成デバッグ ===')
    console.log('Title:', title)
    console.log('Title length:', title.length)
    console.log('Excerpt:', excerpt)
    console.log('Excerpt length:', excerpt.length)
    console.log('Content length:', content.length)
    console.log('Content preview (first 500 chars):', content.substring(0, 500))
    console.log('Content preview (last 200 chars):', content.substring(Math.max(0, content.length - 200)))
    console.log('========================')

    const articleData = {
      title,
      excerpt,
      content
    }

    // 生成結果をログ出力（デバッグ用）
    console.log('Generated article:', {
      title: title.substring(0, 50) + (title.length > 50 ? '...' : ''),
      excerpt: excerpt.substring(0, 100) + (excerpt.length > 100 ? '...' : ''),
      contentLength: content.length,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(articleData)
  } catch (error: any) {
    console.error('Error in generate-article API:', error)
    
    if (error.response) {
      console.error('OpenAI API Error:', error.response.status, error.response.data)
    } else if (error.message) {
      console.error('Error message:', error.message)
    }
    
    return NextResponse.json(
      { 
        error: '記事生成に失敗しました',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}