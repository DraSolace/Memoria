'use client'

import { useEffect, useRef } from 'react'

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const targetMouse = useRef({ x: -1000, y: -1000 })
  const scrollRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.current = { x: e.clientX, y: e.clientY }
    }
    const handleScroll = () => {
      scrollRef.current = window.scrollY
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    const draw = () => {
      time += 0.003
      const { width, height } = canvas

      // Smooth mouse follow (lerp)
      mouseRef.current.x += (targetMouse.current.x - mouseRef.current.x) * 0.08
      mouseRef.current.y += (targetMouse.current.y - mouseRef.current.y) * 0.08

      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const scroll = Math.min(scrollRef.current / 1000, 1)

      ctx.clearRect(0, 0, width, height)

      // Base fill
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, width, height)

      // Ambient warm glow (subtle, drifting)
      const ax = width * (0.3 + Math.sin(time * 0.5) * 0.15)
      const ay = height * (0.5 + Math.cos(time * 0.3) * 0.1)
      const grad1 = ctx.createRadialGradient(ax, ay, 0, ax, ay, width * 0.5)
      grad1.addColorStop(0, `rgba(194, 112, 62, ${0.025 + scroll * 0.01})`)
      grad1.addColorStop(0.5, `rgba(139, 99, 68, ${0.01})`)
      grad1.addColorStop(1, 'transparent')
      ctx.fillStyle = grad1
      ctx.fillRect(0, 0, width, height)

      // Cursor-following warm radial glow
      if (mx > 0 && my > 0) {
        const cursorGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 280)
        cursorGlow.addColorStop(0, 'rgba(194, 112, 62, 0.06)')
        cursorGlow.addColorStop(0.3, 'rgba(194, 112, 62, 0.025)')
        cursorGlow.addColorStop(0.6, 'rgba(139, 99, 68, 0.01)')
        cursorGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = cursorGlow
        ctx.fillRect(0, 0, width, height)
      }

      // Secondary subtle pulse
      const px = width * (0.7 + Math.sin(time) * 0.1)
      const py = height * (0.3 + Math.cos(time * 0.7) * 0.1)
      const grad2 = ctx.createRadialGradient(px, py, 0, px, py, width * 0.35)
      grad2.addColorStop(0, `rgba(26, 21, 16, ${0.35 + Math.sin(time * 2) * 0.08})`)
      grad2.addColorStop(1, 'transparent')
      ctx.fillStyle = grad2
      ctx.fillRect(0, 0, width, height)

      // Noise grain (sparse)
      const imgData = ctx.createImageData(4, 4)
      for (let i = 0; i < imgData.data.length; i += 4) {
        const v = Math.random() * 6
        imgData.data[i] = v
        imgData.data[i + 1] = v
        imgData.data[i + 2] = v
        imgData.data[i + 3] = 12
      }
      for (let x = 0; x < width; x += 100) {
        for (let y = 0; y < height; y += 100) {
          ctx.putImageData(imgData, x, y)
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
