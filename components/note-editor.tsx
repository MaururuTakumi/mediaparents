'use client'

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { Extension } from '@tiptap/core'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useState, useCallback, useEffect, useRef } from 'react'
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
  Heading2,
  Heading3,
  Minus,
  X,
  Type
} from 'lucide-react'

// カスタム拡張：Enterキーで見出しをリセット
const ResetHeadingOnEnter = Extension.create({
  name: 'resetHeadingOnEnter',
  
  addKeyboardShortcuts() {
    return {
      'Enter': ({ editor }) => {
        const { $from, $to } = editor.state.selection
        const node = $from.node()
        
        // 見出しの中でEnterが押された場合
        if (node.type.name.startsWith('heading')) {
          // 現在の位置が見出しの最後の場合
          if ($from.pos === $to.pos && $from.parentOffset === node.content.size) {
            // 通常の段落を挿入
            return editor.commands.insertContent('<p></p>')
          }
        }
        
        return false
      },
    }
  },
})

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
  placeholder = '本文を書く',
  characterLimit = 10000,
  className = ''
}: NoteEditorProps) {
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const [plusButtonPosition, setPlusButtonPosition] = useState(0)
  const editorRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      ResetHeadingOnEnter,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto my-4',
        },
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
      CharacterCount.configure({
        limit: characterLimit,
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[500px] py-8 pr-8',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length) {
          event.preventDefault()
          const files = Array.from(event.dataTransfer.files)
          files.forEach(file => {
            if (file.type.startsWith('image/')) {
              const reader = new FileReader()
              reader.onload = (e) => {
                const src = e.target?.result as string
                editor?.chain().focus().setImage({ src }).run()
              }
              reader.readAsDataURL(file)
            }
          })
          return true
        }
        return false
      },
      handlePaste: (view, event, slice) => {
        const items = event.clipboardData?.items
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
              event.preventDefault()
              const file = items[i].getAsFile()
              if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                  const src = e.target?.result as string
                  editor?.chain().focus().setImage({ src }).run()
                }
                reader.readAsDataURL(file)
              }
              return true
            }
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onUpdate?.(html)
    },
    onSelectionUpdate: ({ editor }) => {
      updatePlusButtonPosition()
    },
  })

  // カーソル位置に基づいて+ボタンの位置を更新
  const updatePlusButtonPosition = useCallback(() => {
    if (!editor || !editorRef.current) return

    // 現在の選択範囲を取得
    const { from } = editor.state.selection
    const coords = editor.view.coordsAtPos(from)
    const editorRect = editorRef.current.getBoundingClientRect()
    
    // エディタの上端からの相対位置を計算
    const relativeTop = coords.top - editorRect.top
    
    // 行の高さを考慮して位置を調整
    setPlusButtonPosition(Math.max(0, relativeTop - 5))
  }, [editor])

  // contentが変更されたときにエディタを更新
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      console.log('🔄 Updating editor content from props...')
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // エディタが初期化されたときに位置を更新
  useEffect(() => {
    if (editor) {
      updatePlusButtonPosition()
    }
  }, [editor, updatePlusButtonPosition])

  const addImage = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files) {
        Array.from(files).forEach(file => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const src = e.target?.result as string
            editor?.chain().focus().setImage({ src }).run()
          }
          reader.readAsDataURL(file)
        })
      }
    }
    input.click()
  }, [editor])

  const setLink = useCallback(() => {
    if (!editor) return
    
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('リンクURLを入力してください:', previousUrl || 'https://')
    
    if (url === null) {
      return
    }
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) {
    return <div className="animate-pulse">エディタを読み込み中...</div>
  }

  const characterCount = editor.storage.characterCount.characters()
  const wordCount = editor.storage.characterCount.words()

  return (
    <div className={`w-full ${className}`}>
      {/* エディタエリア */}
      <div className="relative" ref={editorRef}>
        {/* note.com風の動的＋ボタン */}
        <div 
          className="absolute left-0 z-10 transition-all duration-150 ease-out"
          style={{ top: `${plusButtonPosition}px` }}
        >
            <DropdownMenu open={showPlusMenu} onOpenChange={setShowPlusMenu}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-9 h-9 p-0 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  {showPlusMenu ? <X className="h-4 w-4 text-gray-500" /> : <Plus className="h-4 w-4 text-gray-400" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" className="w-48" sideOffset={8}>
                <DropdownMenuItem 
                  onClick={() => {
                    editor?.chain().focus().setParagraph().run()
                    setShowPlusMenu(false)
                  }}
                  className="flex items-center space-x-3 p-3"
                >
                  <Type className="h-4 w-4" />
                  <span>本文</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    editor?.chain().focus().toggleHeading({ level: 2 }).run()
                    setShowPlusMenu(false)
                  }}
                  className="flex items-center space-x-3 p-3"
                >
                  <Heading2 className="h-4 w-4" />
                  <span>見出し（大）</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    editor?.chain().focus().toggleHeading({ level: 3 }).run()
                    setShowPlusMenu(false)
                  }}
                  className="flex items-center space-x-3 p-3"
                >
                  <Heading3 className="h-4 w-4" />
                  <span>見出し（中）</span>
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
                  <span>箇条書き</span>
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
                  <span>コードブロック</span>
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
            <div className="bg-gray-900 rounded-lg shadow-lg p-1 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 h-8 ${editor.isActive('bold') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
              >
                <Bold className="h-4 w-4 text-white" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 h-8 ${editor.isActive('italic') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
              >
                <Italic className="h-4 w-4 text-white" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-1.5 h-8 ${editor.isActive('strike') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
              >
                <Strikethrough className="h-4 w-4 text-white" />
              </Button>
              <div className="w-px h-6 bg-gray-600 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={setLink}
                className={`p-1.5 h-8 ${editor.isActive('link') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
              >
                <LinkIcon className="h-4 w-4 text-white" />
              </Button>
            </div>
          </BubbleMenu>
        )}

        {/* メインエディタ */}
        <div className="bg-white min-h-[600px] pl-16 pr-4">
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

      {/* エディタ用CSS - note風スタイル */}
      <style dangerouslySetInnerHTML={{ __html: `
        .note-editor-content .ProseMirror {
          outline: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
          color: #333;
          font-size: 16px;
          line-height: 1.8;
        }
        
        .note-editor-content .ProseMirror h1 {
          font-size: 30px;
          font-weight: 700;
          margin: 40px 0 20px 0;
          line-height: 1.4;
          color: #222;
        }
        
        .note-editor-content .ProseMirror h2 {
          font-size: 24px;
          font-weight: 700;
          margin: 36px 0 16px 0;
          line-height: 1.4;
          color: #222;
          border-bottom: none;
        }
        
        .note-editor-content .ProseMirror h3 {
          font-size: 20px;
          font-weight: 700;
          margin: 32px 0 12px 0;
          line-height: 1.5;
          color: #222;
        }
        
        .note-editor-content .ProseMirror p {
          margin: 16px 0;
          line-height: 1.8;
          font-size: 16px;
          color: #222;
        }
        
        .note-editor-content .ProseMirror blockquote {
          border-left: 3px solid #333;
          padding-left: 20px;
          margin: 20px 0;
          font-style: normal;
          color: #666;
        }
        
        .note-editor-content .ProseMirror ul, 
        .note-editor-content .ProseMirror ol {
          padding-left: 30px;
          margin: 20px 0;
        }
        
        .note-editor-content .ProseMirror li {
          margin: 8px 0;
          line-height: 1.8;
        }
        
        .note-editor-content .ProseMirror code {
          background-color: #f7f7f7;
          padding: 2px 4px;
          border-radius: 3px;
          font-size: 14px;
          font-family: Consolas, Monaco, 'Courier New', monospace;
        }
        
        .note-editor-content .ProseMirror pre {
          background-color: #f7f7f7;
          color: #333;
          padding: 16px;
          border-radius: 4px;
          margin: 20px 0;
          overflow-x: auto;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .note-editor-content .ProseMirror hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 40px 0;
        }
        
        .note-editor-content .ProseMirror img {
          max-width: 100%;
          height: auto;
          margin: 30px auto;
          display: block;
        }
        
        .note-editor-content .ProseMirror strong {
          font-weight: 700;
          color: #222;
        }
        
        .note-editor-content .ProseMirror em {
          font-style: italic;
        }
        
        .note-editor-content .ProseMirror a {
          color: #03a9f4;
          text-decoration: none;
          border-bottom: 1px solid #03a9f4;
        }
        
        .note-editor-content .ProseMirror a:hover {
          color: #0288d1;
          border-bottom-color: #0288d1;
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
      ` }} />
    </div>
  )
}