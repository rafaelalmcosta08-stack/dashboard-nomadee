import { createClient, SupabaseClient } from '@supabase/supabase-js'

export function getSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('nomade_supabase_url')
    const localKey = localStorage.getItem('nomade_supabase_key')
    if (localUrl && localKey) {
      return { url: localUrl, key: localKey }
    }
  }
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
  }
}

export function createDynamicSupabaseClient(url?: string, key?: string): SupabaseClient | null {
  const targetUrl = url || getSupabaseCredentials().url
  const targetKey = key || getSupabaseCredentials().key
  if (targetUrl && targetKey) {
    try {
      return createClient(targetUrl, targetKey)
    } catch {
      return null
    }
  }
  return null
}

export const supabase = createDynamicSupabaseClient()
