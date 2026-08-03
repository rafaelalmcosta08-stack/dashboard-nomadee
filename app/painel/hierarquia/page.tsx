'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HierarquiaPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/painel')
  }, [router])
  return null
}
