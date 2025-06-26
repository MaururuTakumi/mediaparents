'use client'

import { useState } from 'react'
import NoteEditor from '@/components/note-editor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestEditorPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [htmlPreview, setHtmlPreview] = useState('')
  const [savedCount, setSavedCount] = useState(0)

  const handleUpdate = (newContent: string) => {
    setContent(newContent)
    setHtmlPreview(newContent)
  }

  const handleSave = () => {
    setSavedCount(savedCount + 1)
    console.log('Saved:', { title, content })
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">テキストエディターテスト（note.com風）</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* エディター */}
        <Card>
          <CardHeader>
            <CardTitle>エディター</CardTitle>
            <p className="text-sm text-gray-500">自動保存回数: {savedCount}</p>
          </CardHeader>
          <CardContent>
            <NoteEditor
              title={title}
              content={content}
              onTitleChange={setTitle}
              onUpdate={handleUpdate}
              onSave={handleSave}
              placeholder="本文を入力..."
            />
          </CardContent>
        </Card>

        {/* HTMLプレビュー */}
        <Card>
          <CardHeader>
            <CardTitle>HTML出力</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">タイトル:</h3>
              <p className="text-gray-700">{title || '(タイトル未入力)'}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">HTML:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[600px] text-sm">
                <code>{htmlPreview || '(空のコンテンツ)'}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* テスト手順 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>テスト手順</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. note.com風の機能</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>タイトル入力欄が上部に配置</li>
              <li>固定ツールバーで編集機能にアクセス</li>
              <li>3秒ごとの自動保存（保存回数を確認）</li>
              <li>保存状態の表示（右上）</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. マークダウンショートカット</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li><code>#</code>+スペース → H1見出し</li>
              <li><code>##</code>+スペース → H2見出し</li>
              <li><code>###</code>+スペース → H3見出し</li>
              <li><code>-</code>+スペース → 箇条書きリスト</li>
              <li><code>1.</code>+スペース → 番号付きリスト</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. キーボードショートカット</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li><kbd>Cmd/Ctrl+B</kbd>: 太字</li>
              <li><kbd>Cmd/Ctrl+I</kbd>: イタリック</li>
              <li><kbd>Cmd/Ctrl+K</kbd>: リンク挿入</li>
              <li><kbd>Cmd/Ctrl+Alt+1</kbd>: H1切り替え</li>
              <li><kbd>Cmd/Ctrl+Alt+2</kbd>: H2切り替え</li>
              <li><kbd>Cmd/Ctrl+Alt+3</kbd>: H3切り替え</li>
              <li><kbd>Cmd/Ctrl+Alt+0</kbd>: 段落に戻す</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">4. 画像機能</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>画像のドラッグ&ドロップ</li>
              <li>クリップボードから画像を貼り付け</li>
              <li>+メニューから画像を選択</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">5. 見出しバグの確認</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>3行のテキストを入力（行1、行2、行3）</li>
              <li>行2を選択してツールバーから見出しを適用</li>
              <li>行1は影響を受けないことを確認</li>
              <li>見出しでEnterを押すと段落に戻ることを確認</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}