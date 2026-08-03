'use client'

import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { cn } from '@/lib/utils'

export interface CometCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  cometColor?: string
  glowColor?: string
  tiltSensitivity?: number
}

export function CometCard({
  children,
  className,
  containerClassName,
  cometColor = 'rgba(59, 130, 246, 0.8)', // vibrant blue/cyan
  glowColor = 'rgba(59, 130, 246, 0.15)',
  tiltSensitivity = 12,
  ...props
}: CometCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Mouse position inside card for 3D tilt
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Mouse position in pixels relative to card top-left for spotlight glow
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth springs for rotation
  const springConfig = { stiffness: 300, damping: 25 }
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltSensitivity, -tiltSensitivity]), springConfig)
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltSensitivity, tiltSensitivity]), springConfig)
  const scale = useSpring(isHovered ? 1.02 : 1, springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    const mouseXPos = e.clientX - rect.left
    const mouseYPos = e.clientY - rect.top

    // Normalize from -0.5 to 0.5 for tilt
    x.set(mouseXPos / width - 0.5)
    y.set(mouseYPos / height - 0.5)

    // Absolute pixel coords for cursor spotlight
    mouseX.set(mouseXPos)
    mouseY.set(mouseYPos)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <div
      className={cn('perspective-1000 group relative select-none', containerClassName)}
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
        className={cn(
          'relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#1F2121]/95 p-6 shadow-2xl transition-colors duration-300 hover:border-white/20',
          className
        )}
        {...props}
      >
        {/* Animated Comet Border Beam / Comet Orbit Effect */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              rx="16"
              fill="none"
              stroke="url(#comet-gradient)"
              strokeWidth="2"
              strokeDasharray="120 400"
              className="animate-[spin_8s_linear_infinite]"
              style={{
                transformOrigin: 'center',
                willChange: 'transform',
              }}
            />
            <defs>
              <linearGradient id="comet-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                <stop offset="30%" stopColor="#60a5fa" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#93c5fd" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Orbiting Comet Light Flare */}
        <div
          className="pointer-events-none absolute -inset-[100%] z-0 opacity-30 transition-opacity duration-500 group-hover:opacity-100 animate-[spin_10s_linear_infinite]"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, ${cometColor} 340deg, transparent 360deg)`,
            transformOrigin: 'center',
            willChange: 'transform',
          }}
        />

        {/* Cursor Spotlight Glow */}
        <motion.div
          className="pointer-events-none absolute -inset-px z-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useTransform(
              [mouseX, mouseY],
              ([cx, cy]) =>
                `radial-gradient(600px circle at ${cx}px ${cy}px, ${glowColor}, transparent 40%)`
            ),
          }}
        />

        {/* Inner Glass Layer to encapsulate 3D depth */}
        <div
          style={{ transform: 'translateZ(20px)' }}
          className="relative z-10 flex h-full flex-col justify-between"
        >
          {children}
        </div>
      </motion.div>
    </div>
  )
}
