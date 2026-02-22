'use client'

import { useState, useCallback } from 'react'
import { Plus, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FooterProps {
  customPhrases: string[]
  onAddPhrase: (phrase: string) => void
  onRemovePhrase: (index: number) => void
}

export function Footer({ customPhrases, onAddPhrase, onRemovePhrase }: FooterProps) {
  const [showPhrases, setShowPhrases] = useState(false)
  const [newPhrase, setNewPhrase] = useState('')

  const handleAdd = useCallback(() => {
    const trimmed = newPhrase.trim()
    if (!trimmed) return
    onAddPhrase(trimmed)
    setNewPhrase('')
  }, [newPhrase, onAddPhrase])

  const now = new Date()
  const dateStr = now.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <footer className="relative z-10 border-t border-border/30 mt-12">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Date centered */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px flex-1 max-w-24 bg-border/30" />
          <span className="font-mono text-xs text-muted-foreground/40 tracking-widest">
            {dateStr}
          </span>
          <div className="h-px flex-1 max-w-24 bg-border/30" />
        </div>

        {/* Phrase management toggle */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowPhrases(prev => !prev)}
            className={cn(
              'group/phrase flex items-center gap-2 px-4 py-2',
              'border border-border/20 bg-transparent',
              'transition-all duration-300',
              'hover:border-warm/30 hover:bg-warm/5',
              showPhrases && 'border-warm/30 bg-warm/5'
            )}
          >
            <Plus className={cn(
              'h-3.5 w-3.5 transition-all duration-300',
              showPhrases ? 'text-warm rotate-45' : 'text-foreground/40 group-hover/phrase:text-warm/70'
            )} />
            <span className="font-serif text-xs italic text-foreground/50 tracking-wide">
              {'Добавить фразу'}
            </span>
          </button>
        </div>

        {/* Phrase panel */}
        <div className={cn(
          'overflow-hidden transition-all duration-500',
          showPhrases ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'
        )}>
          <div className="mx-auto max-w-md">
            {/* Add new phrase */}
            <div className="flex gap-2 mb-4">
              <input
                value={newPhrase}
                onChange={(e) => setNewPhrase(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="flex-1 bg-surface border border-border/40 px-3 py-2 text-sm text-foreground font-serif italic outline-none transition-colors focus:border-warm/50"
                placeholder="Ваша фраза..."
              />
              <button
                onClick={handleAdd}
                disabled={!newPhrase.trim()}
                className={cn(
                  'px-3 py-2 border border-warm/40 text-warm text-xs font-mono uppercase tracking-widest',
                  'transition-all duration-200',
                  'hover:bg-warm/10 hover:border-warm',
                  'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-warm/40'
                )}
              >
                {'+'}
              </button>
            </div>

            {/* Custom phrases list */}
            {customPhrases.length > 0 && (
              <div className="flex flex-col gap-1">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40 mb-1">
                  {'Ваши фразы'}
                </div>
                {customPhrases.map((phrase, i) => (
                  <div
                    key={i}
                    className="group/item flex items-center justify-between gap-2 px-3 py-1.5 border border-border/20 bg-surface/50"
                  >
                    <span className="text-xs text-foreground/60 font-serif italic truncate">
                      {phrase}
                    </span>
                    <button
                      onClick={() => onRemovePhrase(i)}
                      className="p-0.5 text-muted-foreground/30 opacity-0 transition-all group-hover/item:opacity-100 hover:text-destructive"
                      aria-label="Remove phrase"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {customPhrases.length === 0 && (
              <p className="text-center text-xs font-mono text-muted-foreground/30 italic">
                {'Фразы появятся в карусели на заглавной странице'}
              </p>
            )}
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-8 flex items-center justify-center">
          <span className="font-serif text-[10px] text-muted-foreground/20 italic tracking-wider">
            {'MEMORIA'}
          </span>
        </div>
      </div>
    </footer>
  )
}
