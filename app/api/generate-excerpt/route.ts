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

    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと本文が必要です' },
        { status: 400 }
      )
    }

    // HTMLタグを除去してプレーンテキストに変換
    const plainContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

    const prompt = `以下の記事のタイトルと本文から、魅力的で簡潔な要約を生成してください。
要約は100-150文字程度で、記事の主要なポイントを含み、読者の興味を引くものにしてください。

タイトル: ${title}

本文: ${plainContent.substring(0, 2000)}

要約のみを出力してください。`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    })

    const excerpt = completion.choices[0]?.message?.content?.trim() || ''

    // 生成された要約をログ出力
    console.log('Generated excerpt:', {
      title: title.substring(0, 50),
      excerptLength: excerpt.length,
      excerpt: excerpt
    })

    return NextResponse.json({ excerpt })
  } catch (error: any) {
    console.error('Error in generate-excerpt API:', error)
    
    return NextResponse.json(
      { 
        error: '要約生成に失敗しました',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}