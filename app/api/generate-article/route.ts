import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function POST(request: NextRequest) {
  try {
    // APIキーの確認
    if (!process.env.OPENAI_API_KEY || !openai) {
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

    // Step 3: ペルソナ特化型記事雛形生成（HTML形式）
    let contentPrompt = ''
    
    if (studentType && parentPersona) {
      // ペルソナマッチング情報を使用した高度なプロンプト
      contentPrompt = `# あなたの役割
あなたは特定のペルソナペアに最適化された記事をHTML形式で作成する専門家です。
noteエディターで表示されることを前提とし、読みやすく美しいHTML記事を生成してください。

# 出力形式の重要な注意事項
- **必ずHTML形式で出力してください**
- Markdown記法（###、**など）は使用しないでください
- 見出しは<h2>と<h3>タグを使用
- 段落は<p>タグで囲む
- 強調は<strong>タグを使用
- リストは<ul>と<li>タグを使用
- 改行は適切に<br>を使用

# ペルソナマッチング情報
- **学生タイプ**: ${studentType}
- **対象読者**: ${parentPersona}
- **重点質問**: ${personaBasedQuestions ? personaBasedQuestions.join('、') : ''}

# HTML記事のテンプレート

<h2>親御さんへ</h2>
<p>この記事は「${parentPersona}」タイプの親御さんに向けて、「${studentType}」として経験した私の本音をお伝えします。</p>

<h2>1. あの日の出来事</h2>
<p>【ここに具体的なエピソードを記述】</p>
<p>【対話から抽出した内容を基に、2-3段落で構成】</p>

<h2>2. 私が本当に感じていたこと</h2>
<p>【学生の本音を率直に記述】</p>
<p>【なぜそう感じたのか、背景も含めて説明】</p>

<h2>3. 今だから言える感謝</h2>
<p>【親への感謝の気持ちを具体的に】</p>
<ul>
  <li>【感謝ポイント1】</li>
  <li>【感謝ポイント2】</li>
  <li>【感謝ポイント3】</li>
</ul>

<h2>4. 親御さんへのお願い</h2>
<p>もし可能なら、以下のことを心がけていただけると嬉しいです：</p>
<ul>
  <li><strong>【具体的なアドバイス1】</strong><br>【説明】</li>
  <li><strong>【具体的なアドバイス2】</strong><br>【説明】</li>
  <li><strong>【具体的なアドバイス3】</strong><br>【説明】</li>
</ul>

<h2>5. 最後に</h2>
<p>【締めの言葉、希望のメッセージ】</p>
<p>【親子関係の理想像について】</p>

# 対話データ分析
以下の対話から、ペルソナマッチングの視点で内容を抽出し、上記のHTMLテンプレートに当てはめて記事を生成してください。

${conversationText}

# 重要な指示
1. 必ずHTML形式で出力（Markdown記法は使用禁止）
2. 対話から具体的なエピソードを抽出して記事に組み込む
3. 読者（親）の立場に立った共感的な内容にする
4. 学生の本音を率直に、でも建設的に表現する
5. 実践的で具体的なアドバイスを含める`
    } else {
      // フォールバック: 従来のプロンプト（HTML形式）
      contentPrompt = `# あなたの役割
あなたは子育てに悩む親たちに共感され、実際に役立つ記事をHTML形式で作成する専門家です。
noteエディターで表示されることを前提とし、読みやすく美しいHTML記事を生成してください。

# 出力形式の重要な注意事項
- **必ずHTML形式で出力してください**
- Markdown記法（###、**など）は使用しないでください
- 見出しは<h2>と<h3>タグを使用
- 段落は<p>タグで囲む
- 強調は<strong>タグを使用
- リストは<ul>と<li>タグを使用
- 改行は適切に<br>を使用

# 重要な前提
- **読者**: 子育てに悩むお母さん・お父さん（特に中高生〜大学生の子を持つ親）
- **彼らの悩み**: 子どもとのコミュニケーション不足、進路への不安、価値観の違い
- **求めている情報**: 子どもの本音、効果的な関わり方、失敗談と成功談

# HTML記事のテンプレート

<h2>お父さん、お母さんへ</h2>
<p>もしかしたら、お子さんも私と同じように悩んでいるかもしれません。私の経験が少しでも参考になれば嬉しいです。</p>

<h2>1. あの日の出来事</h2>
<p>【対話から抽出した具体的なエピソードを記述】</p>
<p>【状況、親の反応、私の気持ちを2-3段落で展開】</p>

<h2>2. 私が本当に感じていたこと</h2>
<p>【学生の本音を率直に記述】</p>
<p>【なぜそう感じたのか、背景も含めて説明】</p>

<h2>3. 今だから言える感謝</h2>
<p>当時は分からなかったけれど、今なら親の気持ちが理解できます。</p>
<ul>
  <li>【具体的な感謝ポイント1】</li>
  <li>【具体的な感謝ポイント2】</li>
  <li>【具体的な感謝ポイント3】</li>
</ul>

<h2>4. 親御さんへのお願い</h2>
<p>もし可能なら、以下のことを心がけていただけると嬉しいです：</p>

<h3>今すぐできること</h3>
<ul>
  <li><strong>【具体的なアドバイス1】</strong><br>【説明】</li>
  <li><strong>【具体的なアドバイス2】</strong><br>【説明】</li>
  <li><strong>【具体的なアドバイス3】</strong><br>【説明】</li>
</ul>

<h3>避けてほしいこと</h3>
<ul>
  <li>【避けるべき行動1】</li>
  <li>【避けるべき行動2】</li>
  <li>【避けるべき行動3】</li>
</ul>

<h2>5. 最後に伝えたいこと</h2>
<p>【親への感謝と理解のメッセージ】</p>
<p>【理想的な親子関係についての希望】</p>

# データから抽出すべき要素
${conversationText}

から以下を抽出してHTML記事に組み込んでください：
1. 親子間の具体的な衝突や葛藤のエピソード
2. 学生が感じた本音（言えなかった気持ち）
3. 親への要望（こうしてほしかった）
4. 今だから理解できる親の気持ち
5. 他の親御さんへの具体的なアドバイス

**重要**: 必ずHTML形式で出力し、対話ログから具体的な内容を抽出して記事を完成させてください。`
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