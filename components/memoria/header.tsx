'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { BookOpen, Image, Feather, Minus, Search, X, Compass } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DividerItem } from '@/lib/types'

interface HeaderProps {
  dividers: DividerItem[]
  onAddMemory: () => void
  onAddThought: () => void
  onAddDivider: () => void
  onScrollToDivider: (id: string) => void
}

export function Header({
  dividers,
  onAddMemory,
  onAddThought,
  onAddDivider,
  onScrollToDivider,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [bookHovered, setBookHovered] = useState(false)
  const [showNav, setShowNav] = useState(false)
  const [navSearch, setNavSearch] = useState('')
  const [memoryHover, setMemoryHover] = useState(false)
  const [thoughtHover, setThoughtHover] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close nav on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowNav(false)
    }
    if (showNav) {
      document.addEventListener('keydown', handleKey)
      // Focus search on open
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
    return () => document.removeEventListener('keydown', handleKey)
  }, [showNav])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const openNav = useCallback(() => {
    setNavSearch('')
    setShowNav(true)
  }, [])

  const filtered = useMemo(() => {
    if (!navSearch.trim()) return dividers
    const q = navSearch.toLowerCase().trim()
    return dividers.filter(d => d.label.toLowerCase().includes(q))
  }, [dividers, navSearch])

  // Group by first letter for scalability
  const grouped = useMemo(() => {
    const map = new Map<string, DividerItem[]>()
    for (const d of filtered) {
      const letter = d.label.trim()[0]?.toUpperCase() || '#'
      if (!map.has(letter)) map.set(letter, [])
      map.get(letter)!.push(d)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, 'ru'))
  }, [filtered])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out',
          'border-b border-border/50 backdrop-blur-xl',
          scrolled ? 'h-14 bg-background/90' : 'h-16 bg-background/70'
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          {/* Left: Logo */}
          <button
            onClick={scrollToTop}
            onMouseEnter={() => setBookHovered(true)}
            onMouseLeave={() => setBookHovered(false)}
            className="group flex items-center gap-2 transition-transform duration-300 hover:scale-105"
            aria-label="Scroll to top"
          >
            <div className={cn(
              'relative transition-all duration-500',
              bookHovered ? 'rotate-[-8deg] scale-110' : '',
              scrolled ? 'scale-90' : ''
            )}>
              <BookOpen
                className={cn(
                  'transition-all duration-500',
                  bookHovered ? 'text-warm' : 'text-foreground/80',
                  scrolled ? 'h-5 w-5' : 'h-6 w-6'
                )}
                strokeWidth={1.5}
              />
              <div className={cn(
                'absolute -bottom-0.5 left-1/2 h-0.5 -translate-x-1/2 bg-warm transition-all duration-300',
                bookHovered ? 'w-full' : 'w-0'
              )} />
            </div>
            <span className={cn(
              'font-serif text-foreground/90 tracking-wider transition-all duration-500',
              scrolled ? 'text-sm opacity-0 w-0 overflow-hidden' : 'text-base opacity-100'
            )}>
              {'MEM'}<span className="text-warm font-bold">O</span>{'RIA'}
            </span>
          </button>

          {/* Center: Add buttons */}
          <div className="flex items-center gap-2">
            {/* Memory button */}
            <button
              onMouseEnter={() => setMemoryHover(true)}
              onMouseLeave={() => setMemoryHover(false)}
              onClick={onAddMemory}
              className={cn(
                'group/btn relative flex items-center gap-2 px-4 py-2 overflow-hidden',
                'transition-all duration-400',
                'border border-border/30 bg-transparent',
                'hover:border-warm/50 hover:bg-warm/5',
                scrolled && 'px-3 py-1.5'
              )}
            >
              <Image className={cn(
                'transition-all duration-300',
                memoryHover ? 'text-warm scale-110' : 'text-foreground/50',
                scrolled ? 'h-3.5 w-3.5' : 'h-4 w-4'
              )} />
              <span className={cn(
                'font-serif text-foreground/70 italic tracking-wide transition-colors duration-300',
                'group-hover/btn:text-warm',
                scrolled ? 'text-xs' : 'text-sm'
              )}>
                {'\u041E\u0442\u043F\u0435\u0447\u0430\u0442\u043E\u043A'}
              </span>
              <div className={cn(
                'absolute bottom-0 left-0 h-[1px] bg-warm transition-all duration-500',
                memoryHover ? 'w-full' : 'w-0'
              )} />
            </button>

            {/* Thought button */}
            <button
              onMouseEnter={() => setThoughtHover(true)}
              onMouseLeave={() => setThoughtHover(false)}
              onClick={onAddThought}
              className={cn(
                'group/btn relative flex items-center gap-2 px-4 py-2 overflow-hidden',
                'transition-all duration-400',
                'border border-border/30 bg-transparent',
                'hover:border-warm/50 hover:bg-warm/5',
                scrolled && 'px-3 py-1.5'
              )}
            >
              <Feather className={cn(
                'transition-all duration-300',
                thoughtHover ? 'text-warm scale-110 rotate-[-8deg]' : 'text-foreground/50',
                scrolled ? 'h-3.5 w-3.5' : 'h-4 w-4'
              )} />
              <span className={cn(
                'font-serif text-foreground/70 italic tracking-wide transition-colors duration-300',
                'group-hover/btn:text-warm',
                scrolled ? 'text-xs' : 'text-sm'
              )}>
                {'\u041E\u0442\u0433\u043E\u043B\u043E\u0441\u043E\u043A'}
              </span>
              <div className={cn(
                'absolute bottom-0 left-0 h-[1px] bg-warm transition-all duration-500',
                thoughtHover ? 'w-full' : 'w-0'
              )} />
            </button>

            {/* Divider button */}
            <button
              onClick={onAddDivider}
              className={cn(
                'group/btn relative flex items-center gap-2 px-3 py-2 overflow-hidden',
                'transition-all duration-400',
                'border border-border/20 bg-transparent',
                'hover:border-warm/30 hover:bg-warm/5',
                scrolled && 'px-2 py-1.5'
              )}
            >
              <Minus className={cn(
                'text-foreground/40 transition-colors duration-300 group-hover/btn:text-warm/60',
                scrolled ? 'h-3 w-3' : 'h-3.5 w-3.5'
              )} />
              <span className={cn(
                'font-mono text-foreground/40 uppercase tracking-widest transition-colors duration-300',
                'group-hover/btn:text-warm/60',
                scrolled ? 'text-[9px]' : 'text-[10px]',
                'hidden sm:inline'
              )}>
                {'\u0427\u0435\u0440\u0442\u0430'}
              </span>
            </button>
          </div>

          {/* Right: Navigation button */}
          <button
            onClick={openNav}
            className={cn(
              'group/nav flex items-center gap-1.5 px-3 py-1.5',
              'border border-border/30 bg-transparent',
              'transition-all duration-300',
              'hover:border-warm/40 hover:bg-warm/5'
            )}
          >
            <Compass className="h-3.5 w-3.5 transition-colors duration-300 text-foreground/50 group-hover/nav:text-warm/70" />
            <span className="font-serif text-xs italic text-foreground/60 tracking-wide hidden sm:inline">
              {'\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F'}
            </span>
          </button>
        </div>
      </header>

      {/* Navigation overlay / command palette */}
      {showNav && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowNav(false)}
          />

          {/* Palette */}
          <div className="relative w-full max-w-lg mx-4 border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Geometric corner accents */}
            <div className="absolute top-0 left-0 h-4 w-4 border-t border-l border-warm/40" />
            <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-warm/40" />
            <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-warm/40" />
            <div className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-warm/40" />

            {/* Search */}
            <div className="flex items-center gap-3 border-b border-border/30 px-5 py-3">
              <Search className="h-4 w-4 text-warm/60 shrink-0" />
              <input
                ref={searchInputRef}
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder={'\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0440\u0430\u0437\u0434\u0435\u043B\u0430\u043C...'}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none font-serif"
              />
              <button onClick={() => setShowNav(false)} className="p-1 text-muted-foreground/40 hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Divider count */}
            <div className="px-5 py-2 text-[10px] font-mono text-muted-foreground/30 tracking-widest uppercase border-b border-border/15">
              {filtered.length === dividers.length
                ? `${dividers.length} \u0440\u0430\u0437\u0434\u0435\u043B\u043E\u0432`
                : `${filtered.length} \u0438\u0437 ${dividers.length}`}
            </div>

            {/* Results - scrollable, grouped by first letter */}
            <div className="max-h-[50vh] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-muted-foreground/40 font-serif italic">
                    {navSearch ? '\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E' : '\u041D\u0435\u0442 \u0440\u0430\u0437\u0434\u0435\u043B\u043E\u0432'}
                  </p>
                </div>
              ) : (
                grouped.map(([letter, items]) => (
                  <div key={letter}>
                    {/* Letter heading */}
                    <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm px-5 py-1.5 border-b border-border/10">
                      <span className="text-[10px] font-mono text-warm/50 uppercase tracking-widest">
                        {letter}
                      </span>
                    </div>

                    {items.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          onScrollToDivider(d.id)
                          setShowNav(false)
                        }}
                        className={cn(
                          'group/item flex w-full items-center gap-3 px-5 py-2.5',
                          'transition-all duration-150',
                          'hover:bg-warm/5'
                        )}
                      >
                        <div className="h-1 w-1 bg-warm/30 transition-colors duration-150 group-hover/item:bg-warm shrink-0" />
                        <span className="font-serif text-sm text-foreground/60 italic transition-colors duration-150 group-hover/item:text-warm truncate text-left">
                          {d.label}
                        </span>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-center gap-4 border-t border-border/20 px-5 py-2">
              <span className="text-[9px] font-mono text-muted-foreground/25 tracking-wider">
                {'ESC \u2014 \u0437\u0430\u043A\u0440\u044B\u0442\u044C'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
