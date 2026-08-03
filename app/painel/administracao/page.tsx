'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { AdminLoginModal } from '@/components/admin-login-modal'
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Users,
  Check,
  UserCheck,
  KeyRound,
  LogOut,
  ShieldAlert,
  Database,
  Lock,
  Crown,
  Shield,
  Info,
} from 'lucide-react'

export default function AdministracaoPage() {
  const {
    user,
    profile,
    isAdminLoggedIn,
    isSuperAdmin,
    adminQras,
    addAdminQra,
    removeAdminQra,
    setCurrentQra,
    logoutAdmin,
  } = useAuth()

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [newAdminQra, setNewAdminQra] = useState('')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Strict Access Guard: Only logged in admins can view administration page
  if (profile?.role !== 'admin') {
    return (
      <main className="mx-auto max-w-[1600px] px-6 pb-24 pt-16 sm:px-10 lg:px-16">
        <AdminLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        <div className="flex flex-col items-center justify-center gap-4 pt-20 text-center animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary border border-border/40 text-primary shadow-xl">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Área Administrativa Restrita</h1>
          <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
            As permissões de administração e controle de sistema são visíveis somente após realizar o login com usuário e senha do Supabase.
          </p>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="mt-2 flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-lg shadow-primary/20"
          >
            <KeyRound className="h-4.5 w-4.5" />
            <span>Fazer Login Administrativo (Supabase)</span>
          </button>
        </div>
      </main>
    )
  }

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdminQra.trim()) {
      setErrorMsg('Digite o nome ou QRA do oficial.')
      return
    }
    const clean = newAdminQra.trim()
    if (adminQras.some((a) => a.toLowerCase() === clean.toLowerCase())) {
      setErrorMsg('Este QRA já possui permissão de Administrador.')
      return
    }
    addAdminQra(clean)
    setNewAdminQra('')
    setErrorMsg(null)
    setSuccessMsg(`Admin "${clean}" adicionado com sucesso!`)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  const handleRemoveAdmin = (qra: string) => {
    if (!isSuperAdmin) {
      setErrorMsg('Apenas o Administrador Chefe tem permissão para remover outros administradores.')
      setTimeout(() => setErrorMsg(null), 4000)
      return
    }
    removeAdminQra(qra)
    setSuccessMsg(`Permissão de Admin removida para "${qra}".`)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  return (
    <main className="mx-auto max-w-[1600px] px-6 pb-24 pt-16 sm:px-10 lg:px-16">
      {/* Modal Login Admin Supabase */}
      <AdminLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      {/* Page Title */}
      <div className="mb-10 border-b border-border/20 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
            {isSuperAdmin ? <Crown className="h-6 w-6 text-amber-400" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Administração & Acessos
              </h1>
              {isSuperAdmin ? (
                <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Crown className="h-3.5 w-3.5" /> Administrador Chefe
                </span>
              ) : (
                <span className="bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" /> Admin Normal
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {isSuperAdmin
                ? 'Sessão de Administrador Chefe ativa com autoridade máxima sobre todo o painel.'
                : 'Sessão de Administrador ativa com acesso completo para modificar cursos, editais e avisos.'}
            </p>
          </div>
        </div>

        {/* Status Badge & Logout Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Database className="h-4 w-4" />
              <span>{user?.email || 'Admin Supabase'}</span>
            </div>
            <button
              onClick={logoutAdmin}
              className="flex items-center gap-1 text-xs font-bold text-red-400 hover:underline cursor-pointer ml-2 border-l border-emerald-500/20 pl-3"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400 flex items-center gap-2 animate-fade-in">
          <Check className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-400 flex items-center gap-2 animate-fade-in">
          <ShieldAlert className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Account Status & Supabase Guidelines */}
        <div className="space-y-6">
          <div
            className={`rounded-xl border p-6 backdrop-blur-sm shadow-sm space-y-4 ${
              isSuperAdmin
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-emerald-500/30 bg-emerald-500/5'
            }`}
          >
            <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 text-foreground">
              {isSuperAdmin ? (
                <>
                  <Crown className="h-4 w-4 text-amber-400" />
                  <span className="text-amber-400">Administrador Chefe (Master)</span>
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Administrador Normal</span>
                </>
              )}
            </span>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {isSuperAdmin
                ? 'Como primeiro usuário / Administrador Chefe, você tem controle exclusivo para remover outros administradores e gerenciar os acessos masters.'
                : 'Como Administrador Normal, você possui permissão total no painel para criar, editar e excluir cursos, editais e avisos gerais. Apenas o Administrador Chefe pode revogar outros administradores.'}
            </p>

            <button
              onClick={logoutAdmin}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Encerrar Sessão</span>
            </button>
          </div>

          {/* Quick Active QRA Switcher */}
          <div className="rounded-xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm shadow-sm space-y-3">
            <span className="text-xs font-mono font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-primary" />
              QRA de Exibição Atual
            </span>
            <input
              type="text"
              value={profile?.qra || 'Admin'}
              onChange={(e) => setCurrentQra(e.target.value)}
              placeholder="Digite seu QRA..."
              className="w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Admin QRAs List Management */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add New Admin Form */}
          <div className="rounded-xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm shadow-sm">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
              <UserPlus className="h-4 w-4 text-primary" />
              Adicionar Novo Administrador por QRA / Nome
            </h2>

            <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newAdminQra}
                onChange={(e) => setNewAdminQra(e.target.value)}
                placeholder="Digite o QRA ou Nome do policial (Ex: Comandante Silva)..."
                className="flex-1 rounded-lg border border-border/60 bg-background/60 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="rounded-lg bg-foreground px-5 py-2.5 text-xs font-bold text-background hover:bg-foreground/90 transition-all cursor-pointer shrink-0"
              >
                + Adicionar Admin
              </button>
            </form>
          </div>

          {/* List of Admins */}
          <div className="rounded-xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Administradores Autorizados ({adminQras.length})
              </h2>
              <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-amber-400" /> Remoção restrita ao Administrador Chefe
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {adminQras.map((qra, idx) => (
                <div
                  key={qra}
                  className="flex items-center justify-between p-3.5 rounded-lg border border-border/40 bg-background/40 hover:border-border/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold shrink-0">
                      {idx === 0 ? <Crown className="h-4 w-4 text-amber-400" /> : qra[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-xs font-bold text-foreground truncate">{qra}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {idx === 0 ? 'Administrador Chefe' : 'Administrador Autorizado'}
                      </span>
                    </div>
                  </div>

                  {/* Removing admins is allowed ONLY for Administrador Chefe */}
                  <button
                    onClick={() => handleRemoveAdmin(qra)}
                    title={isSuperAdmin ? 'Remover permissão de Admin' : 'Apenas o Administrador Chefe pode remover admins'}
                    className={`p-1.5 rounded-md transition-colors shrink-0 ${
                      isSuperAdmin
                        ? 'text-muted-foreground hover:text-red-400 hover:bg-red-500/10 cursor-pointer'
                        : 'text-muted-foreground/30 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
