'use client'

import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useState, useCallback, useEffect } from 'react'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Plus,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  X
} from 'lucide-react'

interface NoteEditorProps {
  content?: string
  onUpdate?: (content: string) => void
  placeholder?: string
  characterLimit?: number
  className?: string
}

export default function NoteEditor({
  content = '',
  onUpdate,
  placeholder = '記事を書いてみましょう...',
  characterLimit = 10000,
  className = ''
}: NoteEditorProps) {
  const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showPlusMenu, setShowPlusMenu] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: characterLimit,
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onUpdate?.(html)
    },
  })

  // contentが変更されたときにエディタを更新
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      console.log('🔄 Updating editor content from props...')
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const addImage = useCallback(() => {
    const url = window.prompt('画像のURLを入力してください:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const setLink = useCallback(() => {
    if (!editor) return
    
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, '')
    
    if (text) {
      // テキストが選択されている場合
      const url = window.prompt('リンクURLを入力してください:', 'https://')
      if (url) {
        editor.chain().focus().setLink({ href: url }).run()
      }
    } else {
      // テキストが選択されていない場合
      const url = window.prompt('リンクURLを入力してください:', 'https://')
      if (url) {
        const linkText = window.prompt('リンクテキストを入力してください:', 'リンク')
        if (linkText) {
          editor.chain().focus().insertContent(`<a href="${url}">${linkText}</a>`).run()
        }
      }
    }
  }, [editor])

  const unsetLink = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetLink().run()
    }
  }, [editor])

  if (!editor) {
    return <div className="animate-pulse">エディタを読み込み中...</div>
  }

  const characterCount = editor.storage.characterCount.characters()
  const wordCount = editor.storage.characterCount.words()

  return (
    <div className={`w-full ${className}`}>
      {/* エディタエリア */}
      <div className="relative">
        {/* note.com風の左側固定＋ボタン */}
        <div className="absolute left-0 top-4 z-10">
          <DropdownMenu open={showPlusMenu} onOpenChange={setShowPlusMenu}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 p-0 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300"
              >
                {showPlusMenu ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" className="w-48" sideOffset={8}>
              <DropdownMenuItem 
                onClick={() => {
                  editor?.chain().focus().toggleHeading({ level: 2 }).run()
                  setShowPlusMenu(false)
                }}
                className="flex items-center space-x-3 p-3"
              >
                <Heading2 className="h-4 w-4" />
                <span>大見出し</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  editor?.chain().focus().toggleHeading({ level: 3 }).run()
                  setShowPlusMenu(false)
                }}
                className="flex items-center space-x-3 p-3"
              >
                <Heading3 className="h-4 w-4" />
                <span>小見出し</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  addImage()
                  setShowPlusMenu(false)
                }}
                className="flex items-center space-x-3 p-3"
              >
                <ImageIcon className="h-4 w-4" />
                <span>画像</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  editor?.chain().focus().toggleBulletList().run()
                  setShowPlusMenu(false)
                }}
                className="flex items-center space-x-3 p-3"
              >
                <List className="h-4 w-4" />
                <span>箇条書きリスト</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  editor?.chain().focus().toggleOrderedList().run()
                  setShowPlusMenu(false)
                }}
                className="flex items-center space-x-3 p-3"
              >
                <ListOrdered className="h-4 w-4" />
                <span>番号付きリスト</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  editor?.chain().focus().toggleBlockquote().run()
                  setShowPlusMenu(false)
                }}
                className="flex items-center space-x-3 p-3"
              >
                <Quote className="h-4 w-4" />
                <span>引用</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  editor?.chain().focus().toggleCodeBlock().run()
                  setShowPlusMenu(false)
                }}
                className="flex items-center space-x-3 p-3"
              >
                <Code className="h-4 w-4" />
                <span>コード</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  editor?.chain().focus().setHorizontalRule().run()
                  setShowPlusMenu(false)
                }}
                className="flex items-center space-x-3 p-3"
              >
                <Minus className="h-4 w-4" />
                <span>区切り線</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bubble Menu - テキスト選択時に表示されるツールバー */}
        {editor && (
          <BubbleMenu 
            editor={editor} 
            tippyOptions={{ duration: 100 }}
            className="bubble-menu"
          >
            <Card className="p-2 shadow-lg border-0 bg-white">
              <div className="flex space-x-1">
                <Button
                  variant={editor.isActive('bold') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className="p-2"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive('italic') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className="p-2"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive('strike') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className="p-2"
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive('code') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className="p-2"
                >
                  <Code className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={setLink}
                  className="p-2"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                {editor.isActive('link') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={unsetLink}
                    className="p-2 text-red-600"
                  >
                    リンク解除
                  </Button>
                )}
              </div>
            </Card>
          </BubbleMenu>
        )}

        {/* メインエディタ */}
        <div className="bg-white rounded-lg min-h-[600px] border border-gray-200 focus-within:border-blue-500 transition-colors pl-12">
          <EditorContent 
            editor={editor} 
            className="note-editor-content"
          />
        </div>

        {/* フッター統計 */}
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <div className="flex space-x-4">
            <span>{characterCount} 文字</span>
            <span>{wordCount} 単語</span>
          </div>
          <div className="flex space-x-2">
            {characterCount > characterLimit * 0.8 && (
              <span className={characterCount > characterLimit ? 'text-red-500' : 'text-orange-500'}>
                {characterLimit - characterCount} 文字残り
              </span>
            )}
          </div>
        </div>
      </div>

      {/* エディタ用CSS */}
      <style jsx global>{`
        .note-editor-content .ProseMirror {
          outline: none;
        }
        
        .note-editor-content .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem 0;
          line-height: 1.2;
        }
        
        .note-editor-content .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem 0;
          line-height: 1.3;
        }
        
        .note-editor-content .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          line-height: 1.4;
        }
        
        .note-editor-content .ProseMirror p {
          margin: 0.75rem 0;
          line-height: 1.7;
        }
        
        .note-editor-content .ProseMirror blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .note-editor-content .ProseMirror ul, 
        .note-editor-content .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        
        .note-editor-content .ProseMirror li {
          margin: 0.25rem 0;
        }
        
        .note-editor-content .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        
        .note-editor-content .ProseMirror pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
          overflow-x: auto;
        }
        
        .note-editor-content .ProseMirror hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }
        
        .note-editor-content .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        
        .note-editor-content .ProseMirror .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        
        .floating-menu,
        .bubble-menu {
          z-index: 50;
        }
        
        .note-editor-content .ProseMirror:focus {
          outline: none;
        }
      `}</style>
    </div>
  )
}