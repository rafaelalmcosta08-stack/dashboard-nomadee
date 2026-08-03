'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { createDynamicSupabaseClient, getSupabaseCredentials } from '@/lib/supabase'

export interface Profile {
  id: string
  username: string
  qra: string | null
  patente: string | null
  status: 'pendente' | 'aprovado' | 'rejeitado'
  role: 'user' | 'admin'
  adminRole: 'super_admin' | 'admin' | 'user'
  cargo?: string[]
  unidade_administrativa?: string
  unidade_operacional?: string
  status_atividade?: 'Ativo' | 'Inativo'
  cursos?: string[]
  advertencia?: string[]
  discord_username?: string | null
  discord_id?: string | null
  allowed_by?: string | null
  game_id?: string | null
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAdminLoggedIn: boolean
  isSuperAdmin: boolean
  adminQras: string[]
  supabaseUrl: string
  supabaseKey: string
  addAdminQra: (qra: string) => void
  removeAdminQra: (qra: string) => void
  setCurrentQra: (qra: string) => void
  setSupabaseConfig: (url: string, key: string) => void
  loginAdmin: (identifier: string, password: string) => Promise<{ error: string | null }>
  logoutAdmin: () => Promise<void>
  login: (username: string, password: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
}

const DEFAULT_ADMIN_QRAS = ['Oficial', 'Comandante Chefe', 'Admin']

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: false,
  isAdminLoggedIn: false,
  isSuperAdmin: false,
  adminQras: DEFAULT_ADMIN_QRAS,
  supabaseUrl: '',
  supabaseKey: '',
  addAdminQra: () => {},
  removeAdminQra: () => {},
  setCurrentQra: () => {},
  setSupabaseConfig: () => {},
  loginAdmin: async () => ({ error: null }),
  logoutAdmin: async () => {},
  login: async () => ({ error: null }),
  logout: async () => {},
})

const defaultGuestUser: User = {
  id: 'guest-policial-id',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'oficial@policia.internal',
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(defaultGuestUser)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false)
  const [adminQras, setAdminQras] = useState<string[]>(DEFAULT_ADMIN_QRAS)
  const [currentQra, setCurrentQraState] = useState<string>('Oficial')
  const [supabaseUrl, setSupabaseUrlState] = useState<string>('')
  const [supabaseKey, setSupabaseKeyState] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  // Restore credentials and auth state on mount
  useEffect(() => {
    try {
      const creds = getSupabaseCredentials()
      setSupabaseUrlState(creds.url)
      setSupabaseKeyState(creds.key)

      const savedAuthStatus = localStorage.getItem('nomade_admin_authenticated')
      if (savedAuthStatus === 'true') {
        setIsAdminLoggedIn(true)
      }

      const savedSuperStatus = localStorage.getItem('nomade_is_super_admin')
      if (savedSuperStatus === 'true') {
        setIsSuperAdmin(true)
      }

      const savedAdmins = localStorage.getItem('nomade_admin_qras')
      if (savedAdmins) {
        const parsed = JSON.parse(savedAdmins)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAdminQras(parsed)
        }
      }

      const savedQra = localStorage.getItem('nomade_current_qra')
      if (savedQra) {
        setCurrentQraState(savedQra)
      }
    } catch (e) {
      console.error('Error restoring auth state:', e)
    }

    const client = createDynamicSupabaseClient()
    if (client) {
      client.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setSession(session)
          setUser(session.user)
          setIsAdminLoggedIn(true)
          localStorage.setItem('nomade_admin_authenticated', 'true')
          
          const isSuper = session.user.user_metadata?.is_super_admin ?? true
          setIsSuperAdmin(isSuper)
          localStorage.setItem('nomade_is_super_admin', String(isSuper))
        }
      })

      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setSession(session)
          setUser(session.user)
          setIsAdminLoggedIn(true)
          localStorage.setItem('nomade_admin_authenticated', 'true')
          const isSuper = session.user.user_metadata?.is_super_admin ?? true
          setIsSuperAdmin(isSuper)
          localStorage.setItem('nomade_is_super_admin', String(isSuper))
        } else {
          setSession(null)
          setUser(defaultGuestUser)
          setIsAdminLoggedIn(false)
          setIsSuperAdmin(false)
          localStorage.removeItem('nomade_admin_authenticated')
          localStorage.removeItem('nomade_is_super_admin')
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [])

  const setSupabaseConfig = (url: string, key: string) => {
    const cleanUrl = url.trim()
    const cleanKey = key.trim()
    setSupabaseUrlState(cleanUrl)
    setSupabaseKeyState(cleanKey)
    if (cleanUrl && cleanKey) {
      localStorage.setItem('nomade_supabase_url', cleanUrl)
      localStorage.setItem('nomade_supabase_key', cleanKey)
    } else {
      localStorage.removeItem('nomade_supabase_url')
      localStorage.removeItem('nomade_supabase_key')
    }
  }

  // Administrative Login via Email/Username & Password
  const loginAdmin = async (identifier: string, password: string): Promise<{ error: string | null }> => {
    setLoading(true)
    try {
      const client = createDynamicSupabaseClient(supabaseUrl, supabaseKey)

      if (!client) {
        // Fallback demo mode when Supabase is not connected
        if (password.length >= 4) {
          const isFirstUser = !localStorage.getItem('nomade_has_first_admin')
          if (isFirstUser) {
            localStorage.setItem('nomade_has_first_admin', 'true')
          }

          setIsAdminLoggedIn(true)
          // First user or user typing 'chefe' / 'master' becomes Administrador Chefe
          const superRole = isFirstUser || identifier.toLowerCase().includes('chefe') || identifier.toLowerCase().includes('master')
          setIsSuperAdmin(superRole)

          localStorage.setItem('nomade_admin_authenticated', 'true')
          localStorage.setItem('nomade_is_super_admin', String(superRole))
          setCurrentQraState(identifier.toUpperCase() || 'ADMIN CHEFE')
          setLoading(false)
          return { error: null }
        }
        setLoading(false)
        return { error: 'Senha incorreta. Insira a senha administrativa.' }
      }

      let email = identifier.trim()
      if (!email.includes('@')) {
        email = `${email.toLowerCase()}@policiaaspect.internal`
      }

      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setLoading(false)
        return { error: 'Usuário ou senha incorretos no Supabase.' }
      }

      setSession(data.session)
      setUser(data.user)
      setIsAdminLoggedIn(true)
      localStorage.setItem('nomade_admin_authenticated', 'true')

      // Check if user is Administrador Chefe (first user or metadata mark)
      const hasFirstAdmin = localStorage.getItem('nomade_has_first_admin')
      let superRole = false

      if (!hasFirstAdmin) {
        localStorage.setItem('nomade_has_first_admin', 'true')
        superRole = true
      } else {
        superRole = data.user.user_metadata?.is_super_admin ?? false
      }

      setIsSuperAdmin(superRole)
      localStorage.setItem('nomade_is_super_admin', String(superRole))

      if (data.user.email) {
        const qraFromEmail = data.user.email.split('@')[0]
        setCurrentQraState(qraFromEmail.toUpperCase())
      }

      setLoading(false)
      return { error: null }
    } catch (err: any) {
      setLoading(false)
      return { error: err.message || 'Erro de autenticação no Supabase.' }
    }
  }

  // Administrative Logout
  const logoutAdmin = async () => {
    const client = createDynamicSupabaseClient(supabaseUrl, supabaseKey)
    if (client) {
      await client.auth.signOut().catch(() => {})
    }
    setSession(null)
    setUser(defaultGuestUser)
    setIsAdminLoggedIn(false)
    setIsSuperAdmin(false)
    localStorage.removeItem('nomade_admin_authenticated')
    localStorage.removeItem('nomade_is_super_admin')
  }

  const addAdminQra = (qra: string) => {
    const clean = qra.trim()
    if (!clean) return
    if (adminQras.some((a) => a.toLowerCase() === clean.toLowerCase())) return
    const updated = [...adminQras, clean]
    setAdminQras(updated)
    localStorage.setItem('nomade_admin_qras', JSON.stringify(updated))
  }

  const removeAdminQra = (qra: string) => {
    if (!isSuperAdmin) {
      alert('Apenas o Administrador Chefe tem permissão para remover outros administradores.')
      return
    }
    const clean = qra.trim()
    const updated = adminQras.filter((a) => a.toLowerCase() !== clean.toLowerCase())
    setAdminQras(updated)
    localStorage.setItem('nomade_admin_qras', JSON.stringify(updated))
  }

  const setCurrentQra = (qra: string) => {
    const clean = qra.trim() || 'Oficial'
    setCurrentQraState(clean)
    localStorage.setItem('nomade_current_qra', clean)
  }

  // Role calculation
  const role: 'user' | 'admin' = isAdminLoggedIn ? 'admin' : 'user'
  const adminRole: 'super_admin' | 'admin' | 'user' = isAdminLoggedIn
    ? isSuperAdmin
      ? 'super_admin'
      : 'admin'
    : 'user'

  const profile: Profile = {
    id: user?.id || 'guest-policial-id',
    username: user?.email ? user.email.split('@')[0] : currentQra,
    qra: currentQra,
    patente: isSuperAdmin ? 'Administrador Chefe' : 'Oficial',
    status: 'aprovado',
    role: role,
    adminRole: adminRole,
    status_atividade: 'Ativo',
    cargo: isAdminLoggedIn ? ['Alto Comando', 'Comando Bope', 'Diretor APM'] : [],
    unidade_administrativa: '',
    unidade_operacional: '',
  }

  return (
    <AuthContext.Provider
      value={{
        user: user || defaultGuestUser,
        session,
        profile,
        loading,
        isAdminLoggedIn,
        isSuperAdmin,
        adminQras,
        supabaseUrl,
        supabaseKey,
        addAdminQra,
        removeAdminQra,
        setCurrentQra,
        setSupabaseConfig,
        loginAdmin,
        logoutAdmin,
        login: async () => ({ error: null }),
        logout: async () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
