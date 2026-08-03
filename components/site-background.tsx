'use client'

import { DottedSurface } from '@/components/ui/dotted-surface'

interface SiteBackgroundProps {
  hasSidebar?: boolean
}

export function SiteBackground({ hasSidebar = false }: SiteBackgroundProps) {
  return (
    <>
      {/* Dynamic Animated Dotted Surface Background Layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none fixed inset-0 overflow-hidden bg-[#0A0A0A]"
        style={{ zIndex: -10 }}
      >
        <div
          className="pointer-events-none absolute -top-10 left-1/2 h-full w-full -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),transparent_60%)] blur-[50px]"
        />
        <DottedSurface className="size-full" />
      </div>
    </>
  )
}


