'use client'

import { useRef, useCallback, useEffect } from 'react'
import { Bold, Italic, Underline, List, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternalChange = useRef(false)

  // Only set innerHTML from prop on mount or when the value changes externally
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false
      return
    }
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val)
    if (editorRef.current) {
      isInternalChange.current = true
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  return (
    <div className="flex flex-col gap-1">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 pb-1 border-b border-border/20">
        <ToolButton onMouseDown={(e) => { e.preventDefault(); exec('bold') }} aria-label="Bold">
          <Bold className="h-3 w-3" />
        </ToolButton>
        <ToolButton onMouseDown={(e) => { e.preventDefault(); exec('italic') }} aria-label="Italic">
          <Italic className="h-3 w-3" />
        </ToolButton>
        <ToolButton onMouseDown={(e) => { e.preventDefault(); exec('underline') }} aria-label="Underline">
          <Underline className="h-3 w-3" />
        </ToolButton>
        <ToolButton onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList') }} aria-label="List">
          <List className="h-3 w-3" />
        </ToolButton>
        <ToolButton onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', 'blockquote') }} aria-label="Quote">
          <Quote className="h-3 w-3" />
        </ToolButton>
      </div>

      {/* Editor - no dangerouslySetInnerHTML; innerHTML set via ref in useEffect */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="min-h-[60px] max-h-40 overflow-auto text-sm text-foreground/70 leading-relaxed outline-none rich-text-content"
      />
    </div>
  )
}

function ToolButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'p-1 text-muted-foreground/50 transition-colors duration-150',
        'hover:text-warm hover:bg-warm/5'
      )}
      {...props}
    >
      {children}
    </button>
  )
}
