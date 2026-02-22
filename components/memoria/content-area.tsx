'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { Item, Widget, DividerItem } from '@/lib/types'
import { WidgetCard } from './widget-card'
import { DividerLine } from './divider-line'

interface ContentAreaProps {
  items: Item[]
  onUpdateItem: (id: string, updates: Partial<Item>) => void
  onDeleteItem: (id: string) => void
  onReorder: (newItems: Item[]) => void
}

export function ContentArea({
  items,
  onUpdateItem,
  onDeleteItem,
  onReorder,
}: ContentAreaProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [ghostTargetId, setGhostTargetId] = useState<string | null>(null)
  const [ghostPosition, setGhostPosition] = useState<'before' | 'after' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Group items by divider sections
  const sections = useMemo(() => {
    const result: { divider: DividerItem | null; widgets: Widget[] }[] = []
    let currentSection: { divider: DividerItem | null; widgets: Widget[] } = {
      divider: null,
      widgets: [],
    }

    const sorted = [...items].sort((a, b) => a.order - b.order)

    for (const item of sorted) {
      if (item.type === 'divider') {
        result.push(currentSection)
        currentSection = { divider: item as DividerItem, widgets: [] }
      } else {
        currentSection.widgets.push(item as Widget)
      }
    }
    result.push(currentSection)

    return result
  }, [items])

  const handleDragStart = useCallback((id: string) => {
    setDraggedId(id)
  }, [])

  const handleDragEnter = useCallback((targetId: string, rect: DOMRect, clientY: number) => {
    if (!draggedId || draggedId === targetId) {
      if (draggedId === targetId) {
        setGhostTargetId(null)
        setGhostPosition(null)
      }
      return
    }

    const midY = rect.top + rect.height / 2
    const pos = clientY < midY ? 'before' : 'after'

    setGhostTargetId(targetId)
    setGhostPosition(pos)
  }, [draggedId])

  const handleDragEnd = useCallback(() => {
    if (draggedId && ghostTargetId && ghostPosition) {
      const sorted = [...items].sort((a, b) => a.order - b.order)
      const draggedIndex = sorted.findIndex(i => i.id === draggedId)
      const targetIndex = sorted.findIndex(i => i.id === ghostTargetId)

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newItems = [...sorted]
        const [removed] = newItems.splice(draggedIndex, 1)

        let insertIndex = targetIndex
        // If we removed before the target, adjust
        if (draggedIndex < targetIndex) insertIndex--
        if (ghostPosition === 'after') insertIndex++

        newItems.splice(insertIndex, 0, removed)
        const reordered = newItems.map((item, i) => ({ ...item, order: i }))
        onReorder(reordered)
      }
    }

    setDraggedId(null)
    setGhostTargetId(null)
    setGhostPosition(null)
  }, [draggedId, ghostTargetId, ghostPosition, items, onReorder])

  const handleToggleCollapse = useCallback((id: string) => {
    const divider = items.find(i => i.id === id) as DividerItem | undefined
    if (divider) {
      onUpdateItem(id, { collapsed: !divider.collapsed })
    }
  }, [items, onUpdateItem])

  // Handle drop on the container itself (for dropping at end)
  const handleContainerDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleContainerDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleDragEnd()
  }, [handleDragEnd])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 h-px w-16 bg-warm/30" />
        <p className="font-serif text-lg text-muted-foreground/40 italic">
          {'Здесь пока пусто...'}
        </p>
        <p className="mt-1 text-xs font-mono text-muted-foreground/25 tracking-widest">
          {'Добавьте первый отпечаток или отголосок'}
        </p>
        <div className="mt-4 h-px w-16 bg-warm/30" />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="mx-auto max-w-6xl px-6 pb-24"
      onDragOver={handleContainerDragOver}
      onDrop={handleContainerDrop}
    >
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {/* Divider */}
          {section.divider && (
            <DividerLine
              divider={section.divider}
              onUpdate={onUpdateItem}
              onDelete={onDeleteItem}
              onToggleCollapse={handleToggleCollapse}
            />
          )}

          {/* Widgets */}
          <div
            className={cn(
              'flex flex-wrap gap-4 transition-all duration-500',
              section.divider?.collapsed
                ? 'max-h-0 overflow-hidden opacity-0'
                : 'max-h-[9999px] opacity-100'
            )}
          >
            {section.widgets.map((widget) => (
              <WidgetCard
                key={widget.id}
                widget={widget}
                onUpdate={onUpdateItem}
                onDelete={onDeleteItem}
                isDragging={draggedId === widget.id}
                isGhostTarget={ghostTargetId === widget.id}
                ghostPosition={ghostTargetId === widget.id ? ghostPosition : null}
                onDragStart={handleDragStart}
                onDragEnter={handleDragEnter}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
