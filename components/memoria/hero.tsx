'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { Widget, MemoryWidget, ThoughtWidget } from '@/lib/types'

export const DEFAULT_PHRASES = [
  'Где тепло живёт вечно.',
  'Бережно хранимое, никогда не забытое.',
  'Тихие отголоски светлых дней.',
  'Тихое место для того, что важно.',
  'Каждый момент — в сохранности.',
  'Как солнечный свет на старых фотографиях.',
  'То, что заставляло тебя улыбаться.',
  'Дом — это чувство, которое ты носишь в себе.',
  'Записано светом, запечатано временем.',
  'Потому что некоторые вещи должны остаться.',
  'Маленькие кусочки вечности.',
  'Время не стирает — оно укрывает.',
  'Каждый день — строчка в нашей истории.',
  'Мы помним, значит мы были.',
  'Светлое живёт дольше всего.',
  'Сквозь годы, сквозь тишину.',
  'Нити, из которых соткано наше тепло.',
  'Пусть ничего не пропадёт напрасно.',
  'Собрано с любовью, сохранено навсегда.',
  'Между строк — целая жизнь.',
  'И через сто лет — всё тот же свет.',
  'Хрупкое, но настоящее.',
  'Мы здесь, пока помним друг друга.',
  'Тихий огонь, что не гаснет.',
  'Любовь не нуждается в словах, но мы всё же запишем.',
  'Одно мгновение стоит тысячи слов.',
  'Нежность, сложенная в архив.',
  'Не забудь — здесь всё настоящее.',
  'Два сердца, одна история.',
  'Акварель чувств на холсте памяти.',
]

interface HeroProps {
  widgets: Widget[]
  customPhrases: string[]
}

export function Hero({ widgets, customPhrases }: HeroProps) {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [currentWidget, setCurrentWidget] = useState<Widget | null>(null)
  const [widgetFading, setWidgetFading] = useState(false)
  const usedIndicesRef = useRef<Set<number>>(new Set())

  const allPhrases = [...DEFAULT_PHRASES, ...customPhrases]

  // Pick a random widget, avoiding repeats until all are shown
  const pickRandomWidget = useCallback(() => {
    if (widgets.length === 0) return null
    if (widgets.length === 1) return widgets[0]

    if (usedIndicesRef.current.size >= widgets.length) {
      usedIndicesRef.current.clear()
    }

    let idx: number
    do {
      idx = Math.floor(Math.random() * widgets.length)
    } while (usedIndicesRef.current.has(idx) && usedIndicesRef.current.size < widgets.length)

    usedIndicesRef.current.add(idx)
    return widgets[idx]
  }, [widgets])

  // Rotate phrases
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setPhraseIndex(Math.floor(Math.random() * allPhrases.length))
        setVisible(true)
      }, 600)
    }, 4500)
    return () => clearInterval(interval)
  }, [allPhrases.length])

  // Rotate carousel with random selection
  useEffect(() => {
    if (widgets.length === 0) {
      setCurrentWidget(null)
      return
    }
    setCurrentWidget(pickRandomWidget())
    const interval = setInterval(() => {
      setWidgetFading(true)
      setTimeout(() => {
        setCurrentWidget(pickRandomWidget())
        setWidgetFading(false)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [widgets, pickRandomWidget])

  const renderCarouselWidget = useCallback(() => {
    if (!currentWidget) return null

    if (currentWidget.type === 'memory') {
      const mw = currentWidget as MemoryWidget
      return (
        <div className="flex h-full flex-col overflow-hidden">
          <div className="shrink-0 px-6 pt-6 pb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-warm/50">
            {'\u041E\u0442\u043F\u0435\u0447\u0430\u0442\u043E\u043A'}
          </div>
          {mw.imageData && (
            <div className="flex-1 min-h-0 mx-6 mb-2 overflow-hidden">
              <img
                src={mw.imageData}
                alt={mw.caption || 'Memory image'}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="shrink-0 px-6 pb-4">
            {mw.caption && (
              <p className="text-xs text-foreground/60 italic leading-relaxed line-clamp-2">
                {mw.caption}
              </p>
            )}
            {mw.createdAt && (
              <span className="text-[9px] font-mono text-muted-foreground/30 mt-1 block">
                {new Date(mw.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      )
    }

    const tw = currentWidget as ThoughtWidget
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="shrink-0 px-6 pt-6 pb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-warm/50">
          {'\u041E\u0442\u0433\u043E\u043B\u043E\u0441\u043E\u043A'}
        </div>
        <div className="flex-1 min-h-0 overflow-hidden px-6">
          {tw.title && (
            <h4 className="font-serif text-base text-foreground/90 leading-snug mb-2">
              {tw.title}
            </h4>
          )}
          <div
            className="text-sm text-foreground/60 italic leading-relaxed line-clamp-5 rich-text-content"
            dangerouslySetInnerHTML={{ __html: tw.content }}
          />
        </div>
        <div className="shrink-0 px-6 pb-4 pt-2">
          {tw.flavorText && (
            <span className="text-[10px] font-mono text-muted-foreground/40 italic block truncate">
              {tw.flavorText}
            </span>
          )}
          {tw.createdAt && (
            <span className="text-[9px] font-mono text-muted-foreground/30 mt-1 block">
              {new Date(tw.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    )
  }, [currentWidget])

  return (
    <section className="relative flex min-h-[70vh] items-center justify-center px-6 pt-20 pb-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Title + Phrase */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="font-serif text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
            <span className="text-foreground">MEM</span>
            <span className="relative inline-block text-warm">
              <span className="relative z-10">[O]</span>
              <span className="absolute inset-0 animate-pulse bg-warm/5 blur-2xl" />
            </span>
            <span className="text-foreground">RIA</span>
          </h1>

          <div className="mt-6 h-8 overflow-hidden">
            <p
              className={cn(
                'font-serif text-lg text-muted-foreground/80 italic transition-all duration-600',
                visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              )}
            >
              {allPhrases[phraseIndex % allPhrases.length]}
            </p>
          </div>

          <div className="mt-8 flex items-center gap-3 text-xs font-mono text-muted-foreground/40 tracking-widest uppercase">
            <span className="h-px flex-1 max-w-12 bg-border" />
            <span>{''} В каком-то смысле вавилонская библиотека</span>
            <span className="h-px flex-1 max-w-12 bg-border" />
          </div>
        </div>

        {/* Right: Random carousel widget */}
        <div className="h-80 w-full max-w-sm flex-shrink-0 lg:w-80 lg:mr-[8%]">
          <div className="relative h-full w-full border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
            {/* Geometric corner accents - made smaller so they don't collide */}
            <div className="absolute top-0 right-0 h-4 w-4 border-b border-l border-warm/20 z-10" />
            <div className="absolute bottom-0 left-0 h-4 w-4 border-t border-r border-warm/20 z-10" />

            {currentWidget ? (
              <div
                key={currentWidget.id}
                className={cn(
                  'h-full transition-opacity duration-400',
                  widgetFading ? 'opacity-0' : 'opacity-100'
                )}
              >
                {renderCarouselWidget()}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground/40 font-mono">
                {'Пусто...'}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
