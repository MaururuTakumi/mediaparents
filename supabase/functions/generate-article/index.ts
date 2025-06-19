import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateArticleRequest {
  interviewData: Array<{ role: string; content: string }>
  tone: 'logical' | 'emotional' | 'balanced'
  userId: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { interviewData, tone, userId }: GenerateArticleRequest = await req.json()

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    // Step 1: 構成案の生成
    const outlinePrompt = `以下のインタビュー内容から、読者の心に響く記事の構成案を作成してください。

インタビュー内容：
${interviewData.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

トーン: ${tone === 'logical' ? '論理的' : tone === 'emotional' ? '感情的' : 'バランス型'}

以下の形式で構成案を出力してください：
1. タイトル案（3つ）
2. リード文案
3. 本文の構成（見出しと概要）
4. まとめの方向性`

    const outlineResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: '経験豊富な編集者として、大学生の体験談を魅力的な記事構成にまとめてください。' },
          { role: 'user', content: outlinePrompt }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    })

    const outlineData = await outlineResponse.json()
    const outline = outlineData.choices[0].message.content

    // Step 2: 本文の生成
    const articlePrompt = `以下の構成案に基づいて、実際の記事本文を執筆してください。

構成案：
${outline}

インタビュー内容：
${interviewData.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

要件：
- 2000-3000文字程度
- 読者（受験生や保護者）の心に響く内容
- 具体的なエピソードを交える
- ${tone === 'logical' ? '論理的で説得力のある' : tone === 'emotional' ? '感情に訴える共感的な' : 'バランスの取れた'}文体
- Markdown形式で出力`

    const articleResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'プロのライターとして、大学生の体験談を感動的で有益な記事に仕上げてください。' },
          { role: 'user', content: articlePrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    const articleData = await articleResponse.json()
    const article = articleData.choices[0].message.content

    // 記事を保存
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: savedArticle, error } = await supabase
      .from('articles')
      .insert({
        author_id: userId,
        title: '下書き記事', // 後で編集画面でタイトルを設定
        body: article,
        format: 'text',
        status: 'draft',
      })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        articleId: savedArticle.id,
        article: article,
        outline: outline 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})