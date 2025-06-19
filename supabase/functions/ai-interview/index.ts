import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InterviewRequest {
  message: string
  history: Array<{ role: string; content: string }>
  userId: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, history, userId }: InterviewRequest = await req.json()

    // OpenAI APIを使用する場合
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    // STARメソッドと5 Whysに基づいた質問生成
    const systemPrompt = `あなたは優秀なインタビュアーです。大学生の受験体験や学生生活について深掘りする質問をしてください。
    
    以下のフレームワークを活用してください：
    - STARメソッド（Situation, Task, Action, Result）
    - 5 Whys（なぜを5回繰り返して本質に迫る）
    
    質問は：
    - 具体的で答えやすいものにする
    - 感情や学びに焦点を当てる
    - ストーリーを引き出す
    - 1つの質問に絞る（複数質問しない）`

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    })

    if (!openAIResponse.ok) {
      throw new Error('OpenAI API request failed')
    }

    const data = await openAIResponse.json()
    const aiResponse = data.choices[0].message.content

    // 会話履歴を保存（オプション）
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabase
      .from('interview_sessions')
      .insert({
        user_id: userId,
        messages: [...history, { role: 'user', content: message }, { role: 'assistant', content: aiResponse }]
      })

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})