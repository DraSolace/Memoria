'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useAppData } from '@/hooks/use-data'
import type { Item, MemoryWidget, ThoughtWidget, DividerItem, Widget } from '@/lib/types'
import { AnimatedBackground } from '@/components/memoria/animated-bg'
import { Header } from '@/components/memoria/header'
import { Hero } from '@/components/memoria/hero'
import { ContentArea } from '@/components/memoria/content-area'
import { AddModal } from '@/components/memoria/add-modal'
import { Footer } from '@/components/memoria/footer'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export default function MemoriaPage() {
  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    addPhrase,
    removePhrase,
    isLoading,
  } = useAppData()
  const [modalType, setModalType] = useState<'memory' | 'thought' | 'divider' | null>(null)

  const items = data.items || []
  const customPhrases = data.customPhrases || []

  const dividers = useMemo(
    () => items.filter((i): i is DividerItem => i.type === 'divider'),
    [items]
  )

  const widgets = useMemo(
    () => items.filter((i): i is Widget => i.type === 'memory' || i.type === 'thought'),
    [items]
  )

  // Track the currently visible divider via IntersectionObserver
  const [visibleDividerId, setVisibleDividerId] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) observerRef.current.disconnect()

    const visibleSet = new Map<string, number>()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.getAttribute('data-divider-id')
          if (!id) continue
          if (entry.isIntersecting) {
            visibleSet.set(id, entry.intersectionRatio)
          } else {
            visibleSet.delete(id)
          }
        }

        // Pick the divider with highest intersection ratio, or the last one scrolled past
        if (visibleSet.size > 0) {
          let bestId = ''
          let bestRatio = -1
          visibleSet.forEach((ratio, id) => {
            if (ratio > bestRatio) {
              bestRatio = ratio
              bestId = id
            }
          })
          setVisibleDividerId(bestId)
        } else {
          // Find the last divider that's above the viewport
          const sortedItems = [...items].sort((a, b) => a.order - b.order)
          const dividerEls = sortedItems
            .filter(i => i.type === 'divider')
            .map(d => ({
              id: d.id,
              el: document.getElementById(`divider-${d.id}`),
            }))
            .filter(d => d.el)

          let lastAbove: string | null = null
          for (const d of dividerEls) {
            const rect = d.el!.getBoundingClientRect()
            if (rect.bottom < window.innerHeight / 2) {
              lastAbove = d.id
            }
          }
          setVisibleDividerId(lastAbove)
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '-10% 0px -10% 0px' }
    )

    // Observe all divider elements
    const dividerEls = document.querySelectorAll('[data-divider-id]')
    dividerEls.forEach(el => observerRef.current?.observe(el))

    return () => observerRef.current?.disconnect()
  }, [items])

  // Compute the order for inserting after the current visible divider section
  const getInsertOrderForCurrentSection = useCallback(() => {
    const sorted = [...items].sort((a, b) => a.order - b.order)

    if (!visibleDividerId) {
      // No divider visible: find the first divider and insert before it,
      // or at the end if no dividers exist
      const firstDividerIdx = sorted.findIndex(i => i.type === 'divider')
      if (firstDividerIdx === -1) {
        // No dividers at all, append at end
        return sorted.length > 0 ? Math.max(...sorted.map(i => i.order)) + 1 : 0
      }
      // Insert just before the first divider
      // Shift everything from the first divider onward by +1
      const insertOrder = sorted[firstDividerIdx].order
      return insertOrder
    }

    // Find the visible divider's position and the next divider after it
    const dividerIdx = sorted.findIndex(i => i.id === visibleDividerId)
    if (dividerIdx === -1) {
      return sorted.length > 0 ? Math.max(...sorted.map(i => i.order)) + 1 : 0
    }

    // Find the next divider after this one
    let nextDividerIdx = -1
    for (let i = dividerIdx + 1; i < sorted.length; i++) {
      if (sorted[i].type === 'divider') {
        nextDividerIdx = i
        break
      }
    }

    if (nextDividerIdx === -1) {
      // This is the last divider: append at the very end
      return Math.max(...sorted.map(i => i.order)) + 1
    }

    // Insert just before the next divider
    return sorted[nextDividerIdx].order
  }, [items, visibleDividerId])

  // Shift items at or above a given order to make room
  const shiftItemsForInsert = useCallback((insertOrder: number) => {
    const sorted = [...items].sort((a, b) => a.order - b.order)
    const needsShift = sorted.some(i => i.order >= insertOrder)
    if (!needsShift) return null

    // Shift everything >= insertOrder by +1
    return sorted.map(item => {
      if (item.order >= insertOrder) {
        return { ...item, order: item.order + 1 }
      }
      return item
    })
  }, [items])

  const handleAddMemory = useCallback(() => setModalType('memory'), [])
  const handleAddThought = useCallback(() => setModalType('thought'), [])
  const handleAddDivider = useCallback(() => setModalType('divider'), [])
  const handleCloseModal = useCallback(() => setModalType(null), [])

  const handleSubmit = useCallback(async (formData: Record<string, string>) => {
    if (!modalType) return

    if (modalType === 'memory') {
      const insertOrder = getInsertOrderForCurrentSection()
      const shifted = shiftItemsForInsert(insertOrder)
      if (shifted) {
        await reorderItems(shifted)
      }
      const newItem: MemoryWidget = {
        id: generateId(),
        type: 'memory',
        imageData: formData.imageData || '',
        caption: formData.caption || '',
        createdAt: new Date().toISOString(),
        width: 300,
        height: 280,
        order: insertOrder,
      }
      await addItem(newItem)
    } else if (modalType === 'thought') {
      const insertOrder = getInsertOrderForCurrentSection()
      const shifted = shiftItemsForInsert(insertOrder)
      if (shifted) {
        await reorderItems(shifted)
      }
      const newItem: ThoughtWidget = {
        id: generateId(),
        type: 'thought',
        title: formData.title || '',
        content: formData.content || '',
        flavorText: formData.flavorText || '',
        createdAt: new Date().toISOString(),
        width: 280,
        height: 220,
        order: insertOrder,
      }
      await addItem(newItem)
    } else {
      const maxOrder = items.length > 0
        ? Math.max(...items.map(i => i.order)) + 1
        : 0
      const newItem: DividerItem = {
        id: generateId(),
        type: 'divider',
        label: formData.label,
        collapsed: false,
        order: maxOrder,
      }
      await addItem(newItem)
    }
  }, [modalType, getInsertOrderForCurrentSection, shiftItemsForInsert, addItem, items, reorderItems])

  const handleScrollToDivider = useCallback((id: string) => {
    const el = document.getElementById(`divider-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  const handleUpdateItem = useCallback(async (id: string, updates: Partial<Item>) => {
    await updateItem(id, updates)
  }, [updateItem])

  const handleDeleteItem = useCallback(async (id: string) => {
    await deleteItem(id)
  }, [deleteItem])

  const handleReorder = useCallback(async (newItems: Item[]) => {
    await reorderItems(newItems)
  }, [reorderItems])

  return (
    <main className="relative min-h-screen">
      <AnimatedBackground />

      <div className="relative z-10">
        <Header
          dividers={dividers}
          onAddMemory={handleAddMemory}
          onAddThought={handleAddThought}
          onAddDivider={handleAddDivider}
          onScrollToDivider={handleScrollToDivider}
        />

        <Hero widgets={widgets} customPhrases={customPhrases} />

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-6 w-6 border border-warm/30 border-t-warm animate-spin" />
          </div>
        ) : (
          <ContentArea
            items={items}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onReorder={handleReorder}
          />
        )}

        <Footer
          customPhrases={customPhrases}
          onAddPhrase={addPhrase}
          onRemovePhrase={removePhrase}
        />
      </div>

      {/* Add Modal */}
      {modalType && (
        <AddModal
          type={modalType}
          isOpen={true}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />
      )}
    </main>
  )
}
