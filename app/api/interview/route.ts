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

    const { messages, studentType, parentPersona, personaBasedQuestions } = await request.json()

    // ペルソナ情報を使用して動的にシステムプロンプトを生成
    let systemPrompt = `あなたは「子育てに悩む親」向けの記事を作るための専門インタビュアーです。
学生から「親が本当に知りたがっている子どもの本音」を引き出すことが最重要ミッションです。`

    // ペルソナ情報が提供されている場合は、より具体的なプロンプトを使用
    if (studentType && parentPersona) {
      systemPrompt = `あなたは「子育てに悩む親」向けの記事を作るための専門インタビュアーです。

## 今回のインタビュー設定
- **学生タイプ**: ${studentType}
- **対象読者**: ${parentPersona}
- **推奨質問**: ${personaBasedQuestions ? personaBasedQuestions.join('、') : ''}

このペルソナマッチングに基づいて、特に効果的なインタビューを行ってください。

## この読者が特に知りたい情報
対象読者は以下のような悩みを抱えています：
- 子どもとのコミュニケーション方法
- 効果的なサポートの仕方
- 子どもの本当の気持ち
- 同じような状況での成功事例

## 質問戦略
1. **具体的なエピソード重視**
   - 「その時の状況を詳しく教えてください」
   - 「親はどんな反応をしましたか？」
   - 「あなたはその時どう感じましたか？」

2. **親の立場への理解**
   - 「今振り返って、親の気持ちは理解できますか？」
   - 「親は何を心配していたと思いますか？」

3. **実践的アドバイス抽出**
   - 「同じ状況の親御さんにアドバイスするなら？」
   - 「こんな風に言ってくれたら嬉しかったという言葉はありますか？」
   - 「親にやめてほしかったことはありますか？」

## 重要な引き出し方
- 具体的な会話を再現してもらう（「〇〇」と言われた等）
- 感情を詳しく聞く（悲しい→どんな風に悲しかったか）
- 親の立場も理解している姿勢を示しつつ、本音を聞く
- この特定の親ペルソナに役立つ情報を意識的に引き出す

## 質問の進め方
推奨質問を参考にしながら、学生の回答に応じて深掘りしてください。
回答は共感的に、でも「この特定の親ペルソナに役立つ具体的な情報」を必ず引き出す質問で締めくくってください。`
    } else {
      // フォールバック: 従来のプロンプト
      systemPrompt += `

## 親が知りたい情報（必ず聞き出す）
1. **子どもの本音**
   - 「親に言えなかった本当の気持ち」
   - 「本当は親にしてほしかったこと」

2. **具体的なエピソード**
   - 親に言われて嬉しかった/傷ついた言葉
   - その時の詳細な状況（いつ・どこで・どんな流れで）

3. **親への具体的アドバイス**
   - 「こう言ってくれたら嬉しかった」
   - 「こんな時は見守ってほしかった」

## 質問の仕方
- 「その時、本音では親に何と言いたかったですか？」
- 「親にどんな言葉をかけてほしかったですか？」
- 「同じ状況の親御さんにアドバイスするなら？」
- 「今振り返って、親の気持ちはどう思いますか？」

## 重要な引き出し方
- 具体的な会話を再現してもらう（「〇〇」と言われた等）
- 感情を詳しく（悲しい→どんな風に悲しかったか）
- 親の立場も理解している姿勢を示しつつ、本音を聞く

回答は共感的に、でも「親向け記事に使える具体的な情報」を必ず引き出す質問で締めくくってください。`
    }

    // OpenAI APIを呼び出し
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const aiMessage = completion.choices[0]?.message?.content || 'すみません、応答の生成に失敗しました。'

    return NextResponse.json({ message: aiMessage })
  } catch (error: any) {
    console.error('Error in interview API:', error)
    
    // OpenAI APIエラーの詳細をログ出力
    if (error.response) {
      console.error('OpenAI API Error:', error.response.status, error.response.data)
    } else if (error.message) {
      console.error('Error message:', error.message)
    }
    
    return NextResponse.json(
      { 
        error: 'AI応答の生成に失敗しました',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}