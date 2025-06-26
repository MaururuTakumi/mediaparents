'use client'

import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Typography from '@tiptap/extension-typography'
import { Extension } from '@tiptap/core'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
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
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Type,
  ChevronDown,
  Trash2,
  Save,
  Check
} from 'lucide-react'

// カスタム拡張：改善された見出し動作
const ImprovedHeadings = Extension.create({
  name: 'improvedHeadings',
  
  addKeyboardShortcuts() {
    return {
      // Enter: 見出しの最後で押すと段落に戻る
      'Enter': ({ editor }) => {
        const { $from } = editor.state.selection
        const node = $from.parent
        
        if (node.type.name.startsWith('heading')) {
          const endOfNode = $from.end() - 1
          const isAtEnd = $from.pos === endOfNode
          
          if (isAtEnd || node.content.size === 0) {
            // 見出しの最後または空の見出しで、新しい段落を作成
            return editor
              .chain()
              .insertContentAt($from.end(), { type: 'paragraph' })
              .focus($from.end() + 1)
              .run()
          }
        }
        
        return false
      },
      
      // Shift+Enter: 見出し内で改行
      'Shift-Enter': ({ editor }) => {
        const { $from } = editor.state.selection
        const node = $from.parent
        
        if (node.type.name.startsWith('heading')) {
          return editor.commands.insertContent('<br>')
        }
        
        return false
      },
      
      // Backspace: 見出しの先頭で押すと段落に戻る
      'Backspace': ({ editor }) => {
        const { $from, empty } = editor.state.selection
        const node = $from.parent
        
        if (node.type.name.startsWith('heading') && empty) {
          const isAtStart = $from.parentOffset === 0
          
          if (isAtStart) {
            if (node.content.size === 0) {
              // 空の見出しを削除
              return editor.commands.deleteNode('heading')
            } else {
              // 見出しを段落に変換
              return editor.commands.setParagraph()
            }
          }
        }
        
        return false
      },
      
      // ショートカットキー
      'Mod-Alt-1': ({ editor }) => editor.commands.toggleHeading({ level: 1 }),
      'Mod-Alt-2': ({ editor }) => editor.commands.toggleHeading({ level: 2 }),
      'Mod-Alt-3': ({ editor }) => editor.commands.toggleHeading({ level: 3 }),
      'Mod-Alt-0': ({ editor }) => editor.commands.setParagraph(),
      'Mod-b': ({ editor }) => editor.commands.toggleBold(),
      'Mod-i': ({ editor }) => editor.commands.toggleItalic(),
      'Mod-k': ({ editor }) => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('リンクURLを入力してください:', previousUrl || 'https://')
        
        if (url === null) {
          return false
        }
        
        if (url === '') {
          editor.chain().focus().extendMarkRange('link').unsetLink().run()
          return true
        }
        
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        return true
      },
    }
  },
})

// マークダウンショートカット拡張
const MarkdownShortcuts = Extension.create({
  name: 'markdownShortcuts',
  
  addInputRules() {
    return [
      // 見出しの自動変換
      {
        find: /^(#{1,3})\s$/,
        handler: ({ state, range, match }) => {
          const level = match[1].length as 1 | 2 | 3
          this.editor.chain()
            .deleteRange(range)
            .setHeading({ level })
            .run()
        },
      },
      // 箇条書きの自動変換
      {
        find: /^[-*]\s$/,
        handler: ({ state, range }) => {
          this.editor.chain()
            .deleteRange(range)
            .toggleBulletList()
            .run()
        },
      },
      // 番号付きリストの自動変換
      {
        find: /^1\.\s$/,
        handler: ({ state, range }) => {
          this.editor.chain()
            .deleteRange(range)
            .toggleOrderedList()
            .run()
        },
      },
    ]
  },
})

interface NoteEditorProps {
  title?: string
  content?: string
  onTitleChange?: (title: string) => void
  onUpdate?: (content: string) => void
  onSave?: () => void
  placeholder?: string
  characterLimit?: number
  className?: string
}

export default function NoteEditor({
  title = '',
  content = '',
  onTitleChange,
  onUpdate,
  onSave,
  placeholder = '本文を入力...',
  characterLimit = 50000,
  className = ''
}: NoteEditorProps) {
  const [currentTitle, setCurrentTitle] = useState(title)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [selectedStyle, setSelectedStyle] = useState('本文')
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      ImprovedHeadings,
      MarkdownShortcuts,
      Typography,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto my-6 mx-auto rounded-lg',
        },
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline cursor-pointer',
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
        class: 'focus:outline-none min-h-[500px] py-4',
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
      
      // 自動保存
      setSaveStatus('unsaved')
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('saving')
        onSave?.()
        setTimeout(() => setSaveStatus('saved'), 500)
      }, 3000)
    },
  })

  // エディタの選択状態に応じてスタイルセレクタを更新
  useEffect(() => {
    if (!editor) return

    const updateSelectedStyle = () => {
      if (editor.isActive('heading', { level: 1 })) {
        setSelectedStyle('大見出し')
      } else if (editor.isActive('heading', { level: 2 })) {
        setSelectedStyle('中見出し')
      } else if (editor.isActive('heading', { level: 3 })) {
        setSelectedStyle('小見出し')
      } else {
        setSelectedStyle('本文')
      }
    }

    editor.on('selectionUpdate', updateSelectedStyle)
    editor.on('update', updateSelectedStyle)

    return () => {
      editor.off('selectionUpdate', updateSelectedStyle)
      editor.off('update', updateSelectedStyle)
    }
  }, [editor])

  // contentが変更されたときにエディタを更新
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // タイトルの変更ハンドラー
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setCurrentTitle(newTitle)
    onTitleChange?.(newTitle)
    
    // タイトル変更時も自動保存
    setSaveStatus('unsaved')
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saving')
      onSave?.()
      setTimeout(() => setSaveStatus('saved'), 500)
    }, 3000)
  }, [onTitleChange, onSave])

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
    <div className={`w-full max-w-[700px] mx-auto px-4 ${className}`}>
      {/* 保存状態インジケーター */}
      <div className="fixed top-4 right-4 flex items-center space-x-2 text-sm">
        {saveStatus === 'saving' && (
          <>
            <Save className="h-4 w-4 animate-pulse" />
            <span className="text-gray-500">保存中...</span>
          </>
        )}
        {saveStatus === 'saved' && (
          <>
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-gray-500">保存済み</span>
          </>
        )}
      </div>

      {/* タイトル入力欄 */}
      <input
        type="text"
        value={currentTitle}
        onChange={handleTitleChange}
        placeholder="タイトル"
        className="w-full text-3xl md:text-4xl font-bold border-none outline-none placeholder-gray-300 mb-8 bg-transparent"
      />

      {/* ツールバー */}
      <div className="sticky top-0 bg-white z-20 border-b border-gray-200 -mx-4 px-4 py-2">
        <div className="flex items-center space-x-1 flex-wrap">
          {/* スタイルセレクター */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-3">
                <span className="text-sm">{selectedStyle}</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
                <Type className="h-4 w-4 mr-2" />
                本文
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                <Heading1 className="h-4 w-4 mr-2" />
                大見出し
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Heading2 className="h-4 w-4 mr-2" />
                中見出し
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                <Heading3 className="h-4 w-4 mr-2" />
                小見出し
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* テキスト装飾ボタン */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-gray-100' : ''}`}
            title="太字 (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('strike') ? 'bg-gray-100' : ''}`}
            title="取り消し線"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* リストボタン */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-gray-100' : ''}`}
            title="箇条書きリスト"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-gray-100' : ''}`}
            title="番号付きリスト"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* その他のボタン */}
          <Button
            variant="ghost"
            size="sm"
            onClick={setLink}
            className={`h-8 w-8 p-0 ${editor.isActive('link') ? 'bg-gray-100' : ''}`}
            title="リンク (Ctrl+K)"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('blockquote') ? 'bg-gray-100' : ''}`}
            title="引用"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`h-8 w-8 p-0 ${editor.isActive('code') ? 'bg-gray-100' : ''}`}
            title="コード"
          >
            <Code className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* 削除ボタン */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().deleteSelection().run()}
            className="h-8 w-8 p-0 ml-auto"
            title="削除"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* FloatingMenu - 新しい行で表示される+ボタン */}
      {editor && (
        <FloatingMenu 
          editor={editor} 
          tippyOptions={{ 
            duration: 100,
            placement: 'left-start',
            offset: [0, 15],
            zIndex: 20
          }}
          className="floating-menu-plus"
        >
          <div className="relative">
            <button 
              className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all"
              onClick={() => setShowPlusMenu(!showPlusMenu)}
              onBlur={(e) => {
                // メニュー内のクリックでない場合のみ閉じる
                if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) {
                  setTimeout(() => setShowPlusMenu(false), 200)
                }
              }}
            >
              <Plus className="h-4 w-4 text-gray-500" />
            </button>
            
            {showPlusMenu && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    addImage()
                    setShowPlusMenu(false)
                  }}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  画像
                </button>
                <div className="h-px bg-gray-200 my-1" />
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                    setShowPlusMenu(false)
                  }}
                >
                  <Heading2 className="h-4 w-4 mr-2" />
                  大見出し
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                    setShowPlusMenu(false)
                  }}
                >
                  <Heading3 className="h-4 w-4 mr-2" />
                  小見出し
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    editor.chain().focus().toggleBulletList().run()
                    setShowPlusMenu(false)
                  }}
                >
                  <List className="h-4 w-4 mr-2" />
                  箇条書きリスト
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    editor.chain().focus().toggleOrderedList().run()
                    setShowPlusMenu(false)
                  }}
                >
                  <ListOrdered className="h-4 w-4 mr-2" />
                  番号付きリスト
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    editor.chain().focus().toggleBlockquote().run()
                    setShowPlusMenu(false)
                  }}
                >
                  <Quote className="h-4 w-4 mr-2" />
                  引用
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    editor.chain().focus().toggleCodeBlock().run()
                    setShowPlusMenu(false)
                  }}
                >
                  <Code className="h-4 w-4 mr-2" />
                  コード
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    editor.chain().focus().setHorizontalRule().run()
                    setShowPlusMenu(false)
                  }}
                >
                  <Minus className="h-4 w-4 mr-2" />
                  区切り線
                </button>
              </div>
            )}
          </div>
        </FloatingMenu>
      )}

      {/* Bubble Menu - テキスト選択時に表示 */}
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
              className={`p-1.5 h-7 ${editor.isActive('bold') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
            >
              <Bold className="h-3.5 w-3.5 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 h-7 ${editor.isActive('italic') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
            >
              <Italic className="h-3.5 w-3.5 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-1.5 h-7 ${editor.isActive('strike') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
            >
              <Strikethrough className="h-3.5 w-3.5 text-white" />
            </Button>
            <div className="w-px h-5 bg-gray-600" />
            <Button
              variant="ghost"
              size="sm"
              onClick={setLink}
              className={`p-1.5 h-7 ${editor.isActive('link') ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
            >
              <LinkIcon className="h-3.5 w-3.5 text-white" />
            </Button>
          </div>
        </BubbleMenu>
      )}

      {/* メインエディタ */}
      <div className="mt-8 relative">
        <EditorContent 
          editor={editor} 
          className="note-editor-content prose prose-lg max-w-none"
        />
      </div>

      {/* フッター統計 */}
      <div className="flex justify-between items-center mt-12 pt-4 border-t text-sm text-gray-500">
        <div className="flex space-x-4">
          <span>{characterCount.toLocaleString()} 文字</span>
          <span>{wordCount.toLocaleString()} 単語</span>
        </div>
        {characterCount > characterLimit * 0.8 && (
          <span className={characterCount > characterLimit ? 'text-red-500' : 'text-orange-500'}>
            文字数制限まで {(characterLimit - characterCount).toLocaleString()} 文字
          </span>
        )}
      </div>

      {/* エディタ用CSS - note風スタイル */}
      <style dangerouslySetInnerHTML={{ __html: `
        .note-editor-content .ProseMirror {
          outline: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'YuGothic', 'Yu Gothic', Meiryo, sans-serif;
          color: #222;
          line-height: 1.8;
          font-size: 16px;
          padding-left: 50px;
          position: relative;
        }
        
        .note-editor-content .ProseMirror h1 {
          font-size: 32px;
          font-weight: 700;
          margin: 2.5em 0 1em 0;
          line-height: 1.3;
          color: #222;
          letter-spacing: -0.02em;
        }
        
        .note-editor-content .ProseMirror h2 {
          font-size: 26px;
          font-weight: 700;
          margin: 2em 0 0.8em 0;
          line-height: 1.4;
          color: #222;
          letter-spacing: -0.01em;
        }
        
        .note-editor-content .ProseMirror h3 {
          font-size: 20px;
          font-weight: 700;
          margin: 1.8em 0 0.6em 0;
          line-height: 1.5;
          color: #222;
        }
        
        .note-editor-content .ProseMirror p {
          margin: 1.2em 0;
          line-height: 1.8;
          font-size: 16px;
          color: #222;
        }
        
        .note-editor-content .ProseMirror p:first-child {
          margin-top: 0;
        }
        
        .note-editor-content .ProseMirror blockquote {
          border-left: 3px solid #ddd;
          padding-left: 1em;
          margin: 1.5em 0;
          font-style: normal;
          color: #666;
        }
        
        .note-editor-content .ProseMirror ul, 
        .note-editor-content .ProseMirror ol {
          padding-left: 1.5em;
          margin: 1.2em 0;
        }
        
        .note-editor-content .ProseMirror li {
          margin: 0.5em 0;
          line-height: 1.8;
        }
        
        .note-editor-content .ProseMirror li p {
          margin: 0.5em 0;
        }
        
        .note-editor-content .ProseMirror code {
          background-color: #f6f6f6;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-size: 0.9em;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          color: #222;
        }
        
        .note-editor-content .ProseMirror pre {
          background-color: #f6f6f6;
          color: #222;
          padding: 1em;
          border-radius: 6px;
          margin: 1.5em 0;
          overflow-x: auto;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .note-editor-content .ProseMirror pre code {
          background: none;
          padding: 0;
          font-size: inherit;
        }
        
        .note-editor-content .ProseMirror hr {
          border: none;
          border-top: 1px solid #e6e6e6;
          margin: 3em 0;
        }
        
        .note-editor-content .ProseMirror img {
          max-width: 100%;
          height: auto;
          margin: 2em auto;
          display: block;
          border-radius: 8px;
        }
        
        .note-editor-content .ProseMirror strong {
          font-weight: 600;
          color: #222;
        }
        
        .note-editor-content .ProseMirror em {
          font-style: italic;
        }
        
        .note-editor-content .ProseMirror s {
          text-decoration: line-through;
          color: #666;
        }
        
        .note-editor-content .ProseMirror a {
          color: #03a9f4;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s;
        }
        
        .note-editor-content .ProseMirror a:hover {
          border-bottom-color: #03a9f4;
        }
        
        .note-editor-content .ProseMirror .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #aaa;
          pointer-events: none;
          height: 0;
          font-style: normal;
        }
        
        .bubble-menu {
          z-index: 50;
        }
        
        .floating-menu-plus {
          z-index: 20;
        }
        
        .note-editor-content .ProseMirror:focus {
          outline: none;
        }

        /* 選択時のハイライト */
        .note-editor-content .ProseMirror ::selection {
          background-color: rgba(3, 169, 244, 0.15);
        }

        /* Floating Menu のカスタムスタイル */
        .floating-menu-plus {
          margin-left: -45px;
        }
      ` }} />
    </div>
  )
}