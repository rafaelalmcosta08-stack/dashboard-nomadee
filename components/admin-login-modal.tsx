'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { KeyRound, X, AlertTriangle, Check, Lock, Settings, Database, Info, Crown } from 'lucide-react'

interface AdminLoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const { loginAdmin, loading, supabaseUrl, supabaseKey, setSupabaseConfig } = useAuth()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [inputUrl, setInputUrl] = useState(supabaseUrl)
  const [inputKey, setInputKey] = useState(supabaseKey)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault()
    setSupabaseConfig(inputUrl, inputKey)
    setSuccessMsg('Configurações de API do Supabase salvas com sucesso!')
    setShowConfig(false)
    setTimeout(() => setSuccessMsg(null), 2500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!identifier.trim()) {
      setErrorMsg('Digite seu E-mail ou Usuário cadastrado no Supabase.')
      return
    }

    if (!password) {
      setErrorMsg('Digite sua senha.')
      return
    }

    const { error } = await loginAdmin(identifier, password)
    if (error) {
      setErrorMsg(error)
    } else {
      setSuccessMsg('Autenticação de Administrador realizada!')
      setTimeout(() => {
        onClose()
      }, 1200)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card/95 p-6 shadow-2xl backdrop-blur-xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 border border-primary/30 text-primary">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Login Administrativo</h2>
              <p className="text-xs text-muted-foreground">Autenticação de Administradores via Supabase</p>
            </div>
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Configurar Conexão do Supabase"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>API Supabase</span>
          </button>
        </div>

        {/* Informative Guidance Banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Info className="h-4 w-4 text-primary" />
            <span>Como conectar com o seu Supabase:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[11px]">
            <li>Crie os e-mails e senhas dos administradores no Supabase (<strong>Authentication &gt; Users &gt; Add User</strong>).</li>
            <li><strong className="text-amber-400 flex-inline items-center gap-1"><Crown className="h-3 w-3 inline text-amber-400" /> Administrador Chefe:</strong> O primeiro usuário criado terá poder de gerenciar outros admins.</li>
          </ul>
        </div>

        {/* Expandable Supabase Config Panel */}
        {showConfig && (
          <form onSubmit={handleSaveConfig} className="rounded-xl border border-border/60 bg-secondary/30 p-4 space-y-3 animate-fade-in">
            <span className="text-xs font-mono font-bold uppercase text-primary tracking-wider flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5" />
              Configurar Chaves da API do Supabase
            </span>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1">SUPABASE URL</label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://xxxxxx.supabase.co"
                className="w-full rounded-md border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-mono outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1">SUPABASE PUBLISHABLE / ANON KEY</label>
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full rounded-md border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-mono outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-foreground py-2 text-xs font-bold text-background hover:bg-foreground/90 transition-colors cursor-pointer"
            >
              Salvar Credenciais do Supabase
            </button>
          </form>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400 font-semibold flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-400 font-semibold flex items-start gap-2">
            <Check className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              E-mail ou Usuário Supabase *
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Ex: admin@policia.com ou admin"
              className="w-full rounded-lg border border-border/80 bg-background/60 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Senha *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border/80 bg-background/60 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-primary/20"
            >
              <Lock className="h-4 w-4" />
              <span>{loading ? 'Autenticando...' : 'Entrar no Painel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
