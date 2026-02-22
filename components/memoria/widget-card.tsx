'use client'

import { useState, useRef, useCallback } from 'react'
import { Trash2, Pen, Check, X, ImagePlus, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Widget, MemoryWidget, ThoughtWidget } from '@/lib/types'
import { RichTextEditor } from './rich-text-editor'

interface WidgetCardProps {
  widget: Widget
  onUpdate: (id: string, updates: Partial<Widget>) => void
  onDelete: (id: string) => void
  isDragging: boolean
  isGhostTarget: boolean
  ghostPosition: 'before' | 'after' | null
  onDragStart: (id: string) => void
  onDragEnter: (id: string, rect: DOMRect, clientY: number) => void
  onDragEnd: () => void
}

function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function WidgetCard({
  widget,
  onUpdate,
  onDelete,
  isDragging,
  isGhostTarget,
  ghostPosition,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: WidgetCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null)

  // Memory-specific state
  const [editCaption, setEditCaption] = useState(
    widget.type === 'memory' ? (widget as MemoryWidget).caption : ''
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Thought-specific state
  const [editTitle, setEditTitle] = useState(
    widget.type === 'thought' ? (widget as ThoughtWidget).title : ''
  )
  const [editContent, setEditContent] = useState(
    widget.type === 'thought' ? (widget as ThoughtWidget).content : ''
  )
  const [editFlavor, setEditFlavor] = useState(
    widget.type === 'thought' ? (widget as ThoughtWidget).flavorText : ''
  )

  const startEditing = useCallback(() => {
    if (widget.type === 'memory') {
      setEditCaption((widget as MemoryWidget).caption)
    } else {
      setEditTitle((widget as ThoughtWidget).title)
      setEditContent((widget as ThoughtWidget).content)
      setEditFlavor((widget as ThoughtWidget).flavorText)
    }
    setIsEditing(true)
  }, [widget])

  const saveEdit = useCallback(() => {
    if (widget.type === 'memory') {
      onUpdate(widget.id, { caption: editCaption } as Partial<MemoryWidget>)
    } else {
      onUpdate(widget.id, {
        title: editTitle,
        content: editContent,
        flavorText: editFlavor,
      } as Partial<ThoughtWidget>)
    }
    setIsEditing(false)
  }, [widget, editCaption, editTitle, editContent, editFlavor, onUpdate])

  const cancelEdit = useCallback(() => setIsEditing(false), [])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const data = ev.target?.result as string
      onUpdate(widget.id, { imageData: data } as Partial<MemoryWidget>)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [onUpdate, widget.id])

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height,
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeRef.current || !cardRef.current) return
      const newW = Math.max(200, resizeRef.current.startW + (moveEvent.clientX - resizeRef.current.startX))
      const newH = Math.max(150, resizeRef.current.startH + (moveEvent.clientY - resizeRef.current.startY))
      cardRef.current.style.width = `${newW}px`
      cardRef.current.style.height = `${newH}px`
    }

    const handleMouseUp = () => {
      if (!cardRef.current) return
      onUpdate(widget.id, {
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
      })
      resizeRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [onUpdate, widget.id])

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', widget.id)
    const img = document.createElement('img')
    img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
    e.dataTransfer.setDragImage(img, 0, 0)
    onDragStart(widget.id)
  }, [widget.id, onDragStart])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (cardRef.current) {
      onDragEnter(widget.id, cardRef.current.getBoundingClientRect(), e.clientY)
    }
  }, [widget.id, onDragEnter])

  const createdAt = (widget as MemoryWidget | ThoughtWidget).createdAt

  return (
    <div className="relative flex flex-col">
      {/* Ghost insertion indicator BEFORE */}
      {isGhostTarget && ghostPosition === 'before' && (
        <div className="mb-2 h-1 rounded-sm bg-warm/60 transition-all duration-200 animate-in fade-in slide-in-from-left-2" />
      )}

      <div
        ref={cardRef}
        draggable={!isEditing}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={onDragEnd}
        className={cn(
          'group relative flex flex-col border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden',
          'transition-all duration-300 cursor-grab active:cursor-grabbing',
          !isEditing && isHovered && 'border-warm/30 shadow-lg shadow-warm/5',
          isEditing && 'border-warm/50 ring-1 ring-warm/20 cursor-default',
          isDragging && 'opacity-30 scale-95 rotate-1',
          isGhostTarget && 'border-warm/40'
        )}
        style={{
          width: widget.width || (widget.type === 'memory' ? 300 : 280),
          height: widget.height || (widget.type === 'memory' ? 280 : 220),
        }}
        onMouseEnter={() => !isEditing && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Geometric corners */}
        <div className={cn(
          'absolute top-0 left-0 h-3 w-3 border-t border-l transition-colors duration-300 z-10',
          isHovered || isEditing ? 'border-warm/60' : 'border-warm/20'
        )} />
        <div className={cn(
          'absolute top-0 right-0 h-3 w-3 border-t border-r transition-colors duration-300 z-10',
          isHovered || isEditing ? 'border-warm/60' : 'border-warm/20'
        )} />
        <div className={cn(
          'absolute bottom-0 left-0 h-3 w-3 border-b border-l transition-colors duration-300 z-10',
          isHovered || isEditing ? 'border-warm/60' : 'border-warm/20'
        )} />
        <div className={cn(
          'absolute bottom-0 right-0 h-3 w-3 border-b border-r transition-colors duration-300 z-10',
          isHovered || isEditing ? 'border-warm/60' : 'border-warm/20'
        )} />

        {/* Top bar: type badge + actions */}
        <div className="flex items-center justify-between border-b border-border/20 px-3 py-1.5 shrink-0">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-warm/40">
            {widget.type === 'memory' ? '\u041E\u0442\u043F\u0435\u0447\u0430\u0442\u043E\u043A' : '\u041E\u0442\u0433\u043E\u043B\u043E\u0441\u043E\u043A'}
          </span>

          <div className={cn(
            'flex items-center gap-1 transition-opacity duration-200',
            isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}>
            {isEditing ? (
              <>
                <button onClick={saveEdit} className="p-1 text-warm hover:text-warm-light transition-colors" aria-label="Save">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button onClick={cancelEdit} className="p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="Cancel">
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <>
                <button onClick={startEditing} className="p-1 text-muted-foreground/40 hover:text-warm transition-colors" aria-label="Edit">
                  <Pen className="h-3 w-3" />
                </button>
                {widget.type === 'memory' && (widget as MemoryWidget).imageData && (
                  <button
                    onClick={() => {
                      const mw = widget as MemoryWidget
                      if (!mw.imageData) return
                      const link = document.createElement('a')
                      link.href = mw.imageData
                      link.download = `memoria-${widget.id}.jpg`
                      link.click()
                    }}
                    className="p-1 text-muted-foreground/40 hover:text-warm transition-colors"
                    aria-label="Download image"
                  >
                    <Download className="h-3 w-3" />
                  </button>
                )}
                <button onClick={() => onDelete(widget.id)} className="p-1 text-muted-foreground/40 hover:text-destructive transition-colors" aria-label="Delete">
                  <Trash2 className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content - flex-1 with min-h-0 to constrain overflow */}
        <div className="flex-1 min-h-0 flex flex-col p-4 overflow-hidden">
          {widget.type === 'memory' ? (
            <MemoryContent
              widget={widget as MemoryWidget}
              isEditing={isEditing}
              editCaption={editCaption}
              onCaptionChange={setEditCaption}
              fileInputRef={fileInputRef}
              onImageUpload={handleImageUpload}
            />
          ) : (
            <ThoughtContent
              widget={widget as ThoughtWidget}
              isEditing={isEditing}
              editTitle={editTitle}
              editContent={editContent}
              editFlavor={editFlavor}
              onTitleChange={setEditTitle}
              onContentChange={setEditContent}
              onFlavorChange={setEditFlavor}
            />
          )}
        </div>

        {/* Bottom bar: date */}
        <div className="shrink-0 flex items-center justify-end px-3 py-1 border-t border-border/10">
          {createdAt && (
            <span className="text-[9px] font-mono text-muted-foreground/30 tracking-wider">
              {formatDate(createdAt)}
            </span>
          )}
        </div>

        {/* Resize grip */}
        {!isEditing && (
          <div
            onMouseDown={handleResizeStart}
            className={cn(
              'absolute bottom-0 right-0 h-4 w-4 cursor-se-resize z-20',
              'opacity-0 transition-opacity duration-200 group-hover:opacity-100'
            )}
          >
            <svg viewBox="0 0 16 16" className="h-full w-full text-muted-foreground/30">
              <path d="M14 14L8 14L14 8Z" fill="currentColor" />
              <path d="M14 14L11 14L14 11Z" fill="currentColor" opacity="0.5" />
            </svg>
          </div>
        )}
      </div>

      {/* Ghost insertion indicator AFTER */}
      {isGhostTarget && ghostPosition === 'after' && (
        <div className="mt-2 h-1 rounded-sm bg-warm/60 transition-all duration-200 animate-in fade-in slide-in-from-left-2" />
      )}
    </div>
  )
}

/* ---- MEMORY CONTENT ---- */
function MemoryContent({
  widget,
  isEditing,
  editCaption,
  onCaptionChange,
  fileInputRef,
  onImageUpload,
}: {
  widget: MemoryWidget
  isEditing: boolean
  editCaption: string
  onCaptionChange: (v: string) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImageUpload}
        className="hidden"
      />

      {/* Image area */}
      {widget.imageData ? (
        <div className="relative flex-1 min-h-0 mb-2 overflow-hidden group/img">
          <img
            src={widget.imageData}
            alt={widget.caption || 'Memory'}
            className="h-full w-full object-cover"
          />
          {!isEditing && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity duration-200 group-hover/img:opacity-100"
              aria-label="Replace image"
            >
              <ImagePlus className="h-6 w-6 text-warm" />
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2 border border-dashed border-border/40 mb-2 transition-colors hover:border-warm/40 hover:bg-warm/5"
        >
          <ImagePlus className="h-5 w-5 text-muted-foreground/40" />
          <span className="text-xs font-mono text-muted-foreground/40">{'Загрузить фото'}</span>
        </button>
      )}

      {/* Caption */}
      <div className="shrink-0">
        {isEditing ? (
          <input
            value={editCaption}
            onChange={(e) => onCaptionChange(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground/70 italic outline-none placeholder:text-muted-foreground/30 border-b border-border/20 pb-1 focus:border-warm/40"
            placeholder="Подпись..."
          />
        ) : (
          widget.caption && (
            <p className="text-sm text-foreground/60 italic leading-relaxed truncate">
              {widget.caption}
            </p>
          )
        )}
      </div>
    </div>
  )
}

/* ---- THOUGHT CONTENT ---- */
function ThoughtContent({
  widget,
  isEditing,
  editTitle,
  editContent,
  editFlavor,
  onTitleChange,
  onContentChange,
  onFlavorChange,
}: {
  widget: ThoughtWidget
  isEditing: boolean
  editTitle: string
  editContent: string
  editFlavor: string
  onTitleChange: (v: string) => void
  onContentChange: (v: string) => void
  onFlavorChange: (v: string) => void
}) {
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Title line */}
      <div className="shrink-0">
        {isEditing ? (
          <input
            value={editTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="mb-2 w-full bg-transparent font-serif text-base text-foreground outline-none placeholder:text-muted-foreground/30 border-b border-border/20 pb-1 focus:border-warm/40"
            placeholder="Заголовок..."
          />
        ) : (
          widget.title && (
            <h3 className="mb-2 font-serif text-base text-foreground/90 leading-snug text-balance">
              {widget.title}
            </h3>
          )
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {isEditing ? (
          <RichTextEditor value={editContent} onChange={onContentChange} />
        ) : (
          <div
            className="text-sm text-foreground/60 italic leading-relaxed rich-text-content"
            dangerouslySetInnerHTML={{ __html: widget.content }}
          />
        )}
      </div>

      {/* Flavor text - shrink-0 keeps it within bounds */}
      <div className="shrink-0 mt-2 pt-2 border-t border-border/15">
        {isEditing ? (
          <input
            value={editFlavor}
            onChange={(e) => onFlavorChange(e.target.value)}
            className="w-full bg-transparent text-[10px] font-mono text-muted-foreground/50 italic outline-none placeholder:text-muted-foreground/25 focus:text-warm/50"
            placeholder="Пару тёплых слов..."
          />
        ) : (
          widget.flavorText && (
            <span className="text-[10px] font-mono text-muted-foreground/35 italic truncate block">
              {widget.flavorText}
            </span>
          )
        )}
      </div>
    </div>
  )
}
