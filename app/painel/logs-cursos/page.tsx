'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import {
  GraduationCap,
  Search,
  Calendar,
  Clock,
  Users,
  UserCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Shield,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Award,
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  requirements?: string
  startDate: string
  endDate: string
  vagasLimit: number
  creatorId: string
  creatorQra: string
  createdAt: string
  instructorId?: string
  instructorQra?: string
  subscribers: Array<{
    userId: string
    qra: string
    username: string
    subscribedAt: string
  }>
  readBy: string[]
  evaluations?: Record<
    string,
    {
      status: 'Aprovado' | 'Reprovado'
      nota: number
      evaluatedBy: string
      evaluatedAt: string
    }
  >
}

export default function LogsCursosPage() {
  const { session, profile: myProfile, isAdminLoggedIn } = useAuth()
  const router = useRouter()

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null)

  const cargos = myProfile?.cargo ?? []
  const isAltoComando = cargos.includes('Alto Comando') || myProfile?.role === 'admin' || isAdminLoggedIn

  const fetchCourses = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/cursos')
      if (!res.ok) throw new Error('Falha ao buscar registro de cursos.')
      const data = await res.json()
      setCourses(data.courses || [])
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const getStatusBadge = (startDate: string, endDate: string) => {
    const now = new Date().toISOString()
    if (now > endDate) {
      return <span className="rounded-full bg-gray-500/15 border border-gray-500/30 px-2.5 py-0.5 text-xs font-bold text-gray-400">Finalizado</span>
    }
    if (now >= startDate && now <= endDate) {
      return <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400 animate-pulse">Em Andamento</span>
    }
    return <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 text-xs font-bold text-blue-400">Agendado</span>
  }

  // Filter courses based on search term
  const filteredCourses = courses.filter((c) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase().trim()
    const matchTitle = c.title.toLowerCase().includes(term)
    const matchInstructor = (c.instructorQra || '').toLowerCase().includes(term)
    const matchCreator = (c.creatorQra || '').toLowerCase().includes(term)
    const matchSubscriber = c.subscribers.some(
      (s) => s.qra.toLowerCase().includes(term) || s.username.toLowerCase().includes(term)
    )
    return matchTitle || matchInstructor || matchCreator || matchSubscriber
  })

  const totalSubscribersCount = courses.reduce((acc, c) => acc + c.subscribers.length, 0)
  const completedCoursesCount = courses.filter((c) => new Date().toISOString() > c.endDate).length

  if (!isAltoComando) {
    return (
      <div className="mx-auto max-w-[800px] px-6 py-24 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 border border-red-500/30 text-red-400 mb-4">
          <Shield className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">Acesso Restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta seção de auditoria de cursos é exclusiva para a Administração e Alto Comando.
        </p>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-[1600px] px-6 pb-24 pt-28 sm:px-10 lg:px-16">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/20 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
              AUDITORIA DA ACADEMIA DA POLÍCIA MILITAR
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mt-1">
            Logs & Histórico de Cursos
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Relatório detalhado de aplicação, inscrições, instrutores e avaliações de todos os cursos registrados.
          </p>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="rounded-xl border border-border/60 bg-card/45 px-4 py-2.5 backdrop-blur-sm">
            <span className="block text-[10px] font-mono font-bold uppercase text-muted-foreground">Total Cursos</span>
            <span className="block text-xl font-bold font-mono text-foreground">{courses.length}</span>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/45 px-4 py-2.5 backdrop-blur-sm">
            <span className="block text-[10px] font-mono font-bold uppercase text-muted-foreground">Total Inscrições</span>
            <span className="block text-xl font-bold font-mono text-primary">{totalSubscribersCount}</span>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/45 px-4 py-2.5 backdrop-blur-sm">
            <span className="block text-[10px] font-mono font-bold uppercase text-muted-foreground">Cursos Concluídos</span>
            <span className="block text-xl font-bold font-mono text-emerald-400">{completedCoursesCount}</span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/40 border border-border/40 p-4 rounded-xl backdrop-blur-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por curso, instrutor ou oficial inscrito..."
            className="w-full rounded-lg border border-border/60 bg-background/60 pl-9 pr-4 py-2 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          Exibindo {filteredCourses.length} de {courses.length} registros
        </span>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs text-muted-foreground">Sincronizando logs de cursos...</span>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-xl border border-border/40 bg-card/40 p-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/60 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum curso correspondente encontrado para a busca.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => {
            const isExpanded = expandedCourseId === course.id
            const evalCount = course.evaluations ? Object.keys(course.evaluations).length : 0

            return (
              <div
                key={course.id}
                className="rounded-xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm shadow-sm hover:border-border transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(course.startDate, course.endDate)}
                      <span className="text-[11px] font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                        Vagas: {course.subscribers.length} / {course.vagasLimit}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-foreground">{course.title}</h2>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-primary" />
                        Instrutor: <strong className="text-foreground">{course.instructorQra || 'N/A'}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        Início: {formatDateTime(course.startDate)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        Término: {formatDateTime(course.endDate)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer shrink-0 self-start md:self-center"
                  >
                    <span>{isExpanded ? 'Ocultar Detalhes' : 'Ver Detalhes & Inscritos'}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-border/20 space-y-6">
                    {/* Course Description and Requirements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="rounded-lg border border-border/40 bg-secondary/20 p-4 space-y-1">
                        <span className="font-bold text-foreground block">Descrição do Conteúdo</span>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{course.description}</p>
                      </div>
                      <div className="rounded-lg border border-border/40 bg-secondary/20 p-4 space-y-1">
                        <span className="font-bold text-foreground block">Requisitos de Participação</span>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{course.requirements || 'Nenhum requisito especificado.'}</p>
                      </div>
                    </div>

                    {/* Subscribers & Evaluations Table */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                        <span>Lista de Oficiais Inscritos ({course.subscribers.length})</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {evalCount} de {course.subscribers.length} avaliados
                        </span>
                      </h3>

                      {course.subscribers.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic py-2">Nenhum oficial inscrito neste curso até o momento.</p>
                      ) : (
                        <div className="overflow-x-auto rounded-lg border border-border/40 bg-background/40">
                          <table className="w-full text-left text-xs divide-y divide-border/20">
                            <thead className="bg-secondary/30 text-muted-foreground font-bold text-[11px]">
                              <tr>
                                <th className="py-2.5 px-4">Oficial (QRA)</th>
                                <th className="py-2.5 px-3">Data de Inscrição</th>
                                <th className="py-2.5 px-3">Status Avaliação</th>
                                <th className="py-2.5 px-3">Nota</th>
                                <th className="py-2.5 px-3">Avaliador</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/10">
                              {course.subscribers.map((sub) => {
                                const ev = course.evaluations?.[sub.userId]
                                return (
                                  <tr key={sub.userId} className="hover:bg-secondary/20">
                                    <td className="py-2.5 px-4 font-bold text-foreground">
                                      {sub.qra || sub.username}
                                    </td>
                                    <td className="py-2.5 px-3 text-muted-foreground font-mono">
                                      {formatDateTime(sub.subscribedAt)}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      {ev?.status === 'Aprovado' && (
                                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                                          <CheckCircle2 className="h-3 w-3" /> Aprovado
                                        </span>
                                      )}
                                      {ev?.status === 'Reprovado' && (
                                        <span className="inline-flex items-center gap-1 rounded bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold">
                                          <XCircle className="h-3 w-3" /> Reprovado
                                        </span>
                                      )}
                                      {!ev?.status && (
                                        <span className="text-muted-foreground/70 italic text-[11px]">Pendente</span>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                                      {ev?.nota !== undefined ? ev.nota.toFixed(1) : '-'}
                                    </td>
                                    <td className="py-2.5 px-3 text-muted-foreground text-[11px]">
                                      {ev?.evaluatedBy || '-'}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
