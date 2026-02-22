'use client'

import { useState, useCallback, useRef } from 'react'
import { X, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RichTextEditor } from './rich-text-editor'

interface AddModalProps {
  type: 'memory' | 'thought' | 'divider'
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Record<string, string>) => void
}

export function AddModal({ type, isOpen, onClose, onSubmit }: AddModalProps) {
  const [caption, setCaption] = useState('')
  const [imageData, setImageData] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [flavorText, setFlavorText] = useState('')
  const [label, setLabel] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImageData(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleSubmit = useCallback(() => {
    if (type === 'memory') {
      onSubmit({
        imageData: imageData,
        caption: caption,
      })
    } else if (type === 'thought') {
      onSubmit({
        title: title || '',
        content: content || '',
        flavorText: flavorText || '',
      })
    } else {
      onSubmit({
        label: label || 'Новый раздел',
      })
    }
    setCaption('')
    setImageData('')
    setTitle('')
    setContent('')
    setFlavorText('')
    setLabel('')
    onClose()
  }, [type, imageData, caption, title, content, flavorText, label, onSubmit, onClose])

  if (!isOpen) return null

  const titles: Record<string, string> = {
    memory: 'Новый отпечаток',
    thought: 'Новый отголосок',
    divider: 'Новая черта',
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        'relative z-10 w-full max-w-lg mx-4',
        'border border-border/60 bg-card/95 backdrop-blur-xl',
        'animate-in fade-in zoom-in-95 duration-300'
      )}>
        {/* Geometric corners */}
        <div className="absolute top-0 left-0 h-4 w-4 border-t border-l border-warm/40" />
        <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-warm/40" />
        <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-warm/40" />
        <div className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-warm/40" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">
          <h2 className="font-serif text-lg text-foreground/90 italic">
            {titles[type]}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground/50 transition-colors hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          {type === 'memory' && (
            <>
              {/* Image upload */}
              <div>
                <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                  {'Изображение'}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {imageData ? (
                  <div className="relative h-48 overflow-hidden border border-border/40 group/preview">
                    <img src={imageData} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover/preview:opacity-100"
                    >
                      <ImagePlus className="h-6 w-6 text-warm" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-32 w-full flex-col items-center justify-center gap-2 border border-dashed border-border/40 transition-colors hover:border-warm/40 hover:bg-warm/5"
                  >
                    <ImagePlus className="h-6 w-6 text-muted-foreground/40" />
                    <span className="text-xs font-mono text-muted-foreground/40">{'Нажмите для загрузки'}</span>
                  </button>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                  {'Подпись'}
                </label>
                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-surface border border-border/40 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-warm/50"
                  placeholder="Что запечатлено..."
                />
              </div>
            </>
          )}

          {type === 'thought' && (
            <>
              <div>
                <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                  {'Заголовок'}
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface border border-border/40 px-3 py-2 text-sm text-foreground font-serif outline-none transition-colors focus:border-warm/50"
                  placeholder="О чём это..."
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                  {'Содержание'}
                </label>
                <div className="bg-surface border border-border/40 p-3 transition-colors focus-within:border-warm/50">
                  <RichTextEditor value={content} onChange={setContent} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                  {'Тёплые слова'}
                </label>
                <input
                  value={flavorText}
                  onChange={(e) => setFlavorText(e.target.value)}
                  className="w-full bg-surface border border-border/40 px-3 py-2 text-sm text-foreground italic outline-none transition-colors focus:border-warm/50"
                  placeholder="4-5 слов от души..."
                  maxLength={60}
                />
              </div>
            </>
          )}

          {type === 'divider' && (
            <div>
              <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                {'Название раздела'}
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-surface border border-border/40 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-warm/50"
                placeholder="Лето 2024..."
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border/30 px-6 py-4">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            {'Отмена'}
          </button>
          <button
            onClick={handleSubmit}
            className={cn(
              'group/submit relative px-5 py-2 text-xs font-serif italic tracking-wide overflow-hidden',
              'border border-warm/50 text-warm',
              'transition-all duration-300 hover:bg-warm/10 hover:border-warm hover:shadow-sm hover:shadow-warm/10'
            )}
          >
            {'Сохранить'}
            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-warm transition-all duration-500 group-hover/submit:w-full" />
          </button>
        </div>
      </div>
    </div>
  )
}
