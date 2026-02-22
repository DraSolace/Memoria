'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, Trash2, Pen, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DividerItem } from '@/lib/types'

interface DividerLineProps {
  divider: DividerItem
  onUpdate: (id: string, updates: Partial<DividerItem>) => void
  onDelete: (id: string) => void
  onToggleCollapse: (id: string) => void
}

export function DividerLine({
  divider,
  onUpdate,
  onDelete,
  onToggleCollapse,
}: DividerLineProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editLabel, setEditLabel] = useState(divider.label)

  const saveLabel = useCallback(() => {
    onUpdate(divider.id, { label: editLabel })
    setIsEditing(false)
  }, [divider.id, editLabel, onUpdate])

  return (
    <div
      id={`divider-${divider.id}`}
      className="group relative flex items-center gap-4 py-6 scroll-mt-20"
    >
      {/* Left line */}
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border" />

      {/* Center label */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleCollapse(divider.id)}
          className="flex items-center gap-2 px-3 py-1 text-xs font-mono uppercase tracking-widest text-muted-foreground/60 transition-colors duration-200 hover:text-warm"
        >
          <ChevronDown
            className={cn(
              'h-3 w-3 transition-transform duration-300',
              divider.collapsed ? '-rotate-90' : ''
            )}
          />
          {isEditing ? (
            <input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveLabel()}
              className="bg-transparent text-xs font-mono uppercase tracking-widest text-foreground outline-none w-32"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span>{divider.label}</span>
          )}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {isEditing ? (
            <>
              <button onClick={saveLabel} className="p-1 text-warm hover:text-warm-light transition-colors" aria-label="Save">
                <Check className="h-3 w-3" />
              </button>
              <button onClick={() => setIsEditing(false)} className="p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="Cancel">
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setEditLabel(divider.label); setIsEditing(true) }} className="p-1 text-muted-foreground/40 hover:text-warm transition-colors" aria-label="Edit label">
                <Pen className="h-3 w-3" />
              </button>
              <button onClick={() => onDelete(divider.id)} className="p-1 text-muted-foreground/40 hover:text-destructive transition-colors" aria-label="Delete divider">
                <Trash2 className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Right line */}
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border" />
    </div>
  )
}
