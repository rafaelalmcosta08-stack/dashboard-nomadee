'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { cleanImageUrl } from '@/lib/utils'
import { 
  Crosshair, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ListPlus
} from 'lucide-react'

interface Armamento {
  id: string
  name: string
  photoUrl: string | null
  code: string
  category: string
  minPatente: string
  allowedUnits: string[]
  createdAt: string
}

const UNIDADES = [
  'Todas',
  'RPM',
  'GRR',
  'GRAER',
  'ROCAM',
  'CHOQUE',
  'BOPE'
]

const PATENTES = [
  'Coronel',
  'Tenente-Coronel',
  'Major',
  'Capitão',
  '1º Tenente',
  '2º Tenente',
  'Aluno Oficial',
  'Sub Tenente',
  '1º Sargento',
  '2º Sargento',
  '3º Sargento',
  'Cabo',
  'Soldado',
  'Recruta',
]

const DEFAULT_DISTRIBUTIONS: Armamento[] = [
  {
    id: 'seed-recruta',
    name: 'Recruta',
    photoUrl: null,
    code: JSON.stringify(['Pistola Glock', 'Sub PDW']),
    category: 'Distribuição por Patente',
    minPatente: JSON.stringify(['Recruta']),
    allowedUnits: ['Todas'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'seed-soldado',
    name: 'Soldado',
    photoUrl: null,
    code: JSON.stringify(['Pistola Glock ou Five', 'SMG MP5', 'Carabina MK2']),
    category: 'Distribuição por Patente',
    minPatente: JSON.stringify(['Soldado']),
    allowedUnits: ['Todas'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'seed-cabo',
    name: 'Cabo',
    photoUrl: null,
    code: JSON.stringify(['Pistola Glock ou Five', 'SMG MP5 ou MTAR', 'Carabina MK2']),
    category: 'Distribuição por Patente',
    minPatente: JSON.stringify(['Cabo']),
    allowedUnits: ['Todas'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'seed-sargento',
    name: 'Sargento ou superior',
    photoUrl: null,
    code: JSON.stringify(['Pistola Glock ou Five', 'SMG MP5 ou MTAR', 'Carabina MK2', 'G36 (ambos os modelos)']),
    category: 'Distribuição por Patente',
    minPatente: JSON.stringify(['3º Sargento']),
    allowedUnits: ['Todas'],
    createdAt: new Date().toISOString()
  }
]

export default function ArmamentoPage() {
  const { profile, session } = useAuth()
  const [items, setItems] = useState<Armamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [search, setSearch] = useState('')
  const [filterUnit, setFilterUnit] = useState('Todas')

  // Controle de Modal de Cadastro / Edição
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Armamento | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [weaponsText, setWeaponsText] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [selectedPatentes, setSelectedPatentes] = useState<string[]>(['Recruta'])
  const [selectedUnits, setSelectedUnits] = useState<string[]>(['Todas'])
  const [submitting, setSubmitting] = useState(false)

  const isAltoComando = profile?.cargo?.includes('Alto Comando') || profile?.role === 'admin'

  async function loadItems() {
    setLoading(true)
    try {
      const res = await fetch('/api/armamentos')
      if (res.ok) {
        const data = await res.json()
        const apiItems: Armamento[] = data.armamentos || []
        if (apiItems.length === 0) {
          setItems(DEFAULT_DISTRIBUTIONS)
        } else {
          setItems(apiItems)
        }
      } else {
        setItems(DEFAULT_DISTRIBUTIONS)
      }
    } catch (_) {
      setItems(DEFAULT_DISTRIBUTIONS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  function parseWeaponsList(item: Armamento): string[] {
    if (item.code) {
      try {
        if (item.code.trim().startsWith('[')) {
          const parsed = JSON.parse(item.code)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(String)
          }
        }
      } catch (_) {}
    }
    if (item.name && item.name.includes('\n')) {
      return item.name.split('\n').map(s => s.trim()).filter(Boolean)
    }
    return [item.name]
  }

  function openCreateModal() {
    setEditingItem(null)
    setName('Soldado')
    setWeaponsText('Pistola Glock ou Five\nSMG MP5\nCarabina MK2')
    setPhotoUrl('')
    setSelectedPatentes(['Soldado'])
    setSelectedUnits(['Todas'])
    setError(null)
    setIsModalOpen(true)
  }

  function openEditModal(item: Armamento) {
    setEditingItem(item)
    setName(item.name)
    const list = parseWeaponsList(item)
    setWeaponsText(list.join('\n'))
    setPhotoUrl(item.photoUrl || '')
    
    let pats: string[] = ['Recruta']
    try {
      if (item.minPatente && item.minPatente.startsWith('[')) {
        pats = JSON.parse(item.minPatente)
      } else if (item.minPatente) {
        pats = [item.minPatente]
      }
    } catch (_) {
      pats = [item.minPatente || 'Recruta']
    }
    setSelectedPatentes(pats)
    setSelectedUnits(item.allowedUnits.length > 0 ? item.allowedUnits : ['Todas'])
    setError(null)
    setIsModalOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Deseja realmente excluir esta lista de distribuição por patente?')) return

    if (id.startsWith('seed-')) {
      setItems(prev => prev.filter(item => item.id !== id))
      return
    }

    try {
      const res = await fetch('/api/armamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ action: 'delete', id })
      })
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id))
      } else {
        const d = await res.json()
        alert(d.error || 'Erro ao excluir.')
      }
    } catch (_) {
      alert('Erro de conexão ao tentar excluir.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !weaponsText.trim() || selectedPatentes.length === 0) {
      setError('Preencha os campos obrigatórios: Nome da Patente, pelo menos 1 Armamento e a Patente Mínima.')
      return
    }

    setSubmitting(true)
    setError(null)

    const weaponsArray = weaponsText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)

    const payload = {
      action: editingItem && !editingItem.id.startsWith('seed-') ? 'edit' : 'create',
      id: editingItem && !editingItem.id.startsWith('seed-') ? editingItem.id : undefined,
      name: name.trim(),
      photoUrl: photoUrl.trim(),
      category: 'Distribuição por Patente',
      code: JSON.stringify(weaponsArray),
      minPatente: selectedPatentes,
      allowedUnits: selectedUnits
    }

    try {
      const res = await fetch('/api/armamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar o registro.')
      }

      setIsModalOpen(false)
      loadItems()
    } catch (err: any) {
      setError(err.message || 'Erro de rede.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleUnitToggle(unit: string) {
    if (unit === 'Todas') {
      setSelectedUnits(['Todas'])
      return
    }
    setSelectedUnits(prev => {
      const copy = prev.filter(u => u !== 'Todas')
      if (copy.includes(unit)) {
        const updated = copy.filter(u => u !== unit)
        return updated.length === 0 ? ['Todas'] : updated
      } else {
        return [...copy, unit]
      }
    })
  }

  // Safe read helper: calcula a patente mínima e retorna label com '+' (ex: Soldado+)
  function getMinPatenteInfo(rawPatentes: any) {
    let pats: string[] = []
    try {
      if (typeof rawPatentes === 'string') {
        if (rawPatentes.startsWith('[')) {
          pats = JSON.parse(rawPatentes)
        } else if (rawPatentes) {
          pats = [rawPatentes]
        }
      } else if (Array.isArray(rawPatentes)) {
        pats = rawPatentes
      }
    } catch (_) {
      pats = []
    }

    if (pats.includes('ALL_BY_UNIT')) {
      return { isAllByUnit: true, label: 'Toda a Hierarquia da Unidade', minPatente: null, minPatenteIndex: -1 }
    }

    const validPats = pats.map(p => p.replace(/\+$/, '')).filter(p => PATENTES.includes(p))
    const recrutaIdx = PATENTES.indexOf('Recruta') !== -1 ? PATENTES.indexOf('Recruta') : PATENTES.length - 1

    if (validPats.length === 0) {
      return { isAllByUnit: false, label: 'Recruta+', minPatente: 'Recruta', minPatenteIndex: recrutaIdx }
    }

    let minPatenteIndex = -1
    let minPatenteName = 'Recruta'

    // No array PATENTES, a menor patente (Recruta) tem o maior índice (13) e Coronel o menor (0).
    // A patente mínima autorizada é a menor patente da lista (maior índice em PATENTES).
    for (const pat of validPats) {
      const idx = PATENTES.indexOf(pat)
      if (idx > minPatenteIndex) {
        minPatenteIndex = idx
        minPatenteName = pat
      }
    }

    if (minPatenteIndex === -1) {
      minPatenteIndex = recrutaIdx
      minPatenteName = 'Recruta'
    }

    return {
      isAllByUnit: false,
      label: `${minPatenteName}+`,
      minPatente: minPatenteName,
      minPatenteIndex
    }
  }

  // Verificação de permissão baseada em Patente Mínima e Divisão
  function canUserUseItem(item: Armamento) {
    if (isAltoComando) return true

    // 1. Verifica Unidade
    const myUnit = profile?.unidade_operacional || 'Sem Efetividade'
    const unitAllowed = item.allowedUnits.includes('Todas') || item.allowedUnits.includes(myUnit)

    // 2. Verifica Patente Mínima
    const myPatente = profile?.patente || 'Recruta'
    const info = getMinPatenteInfo(item.minPatente)
    
    if (info.isAllByUnit) return unitAllowed

    const userIdx = PATENTES.indexOf(myPatente)
    // O usuário pode usar se sua patente for maior ou igual à patente mínima (índice em PATENTES menor ou igual)
    const patenteAllowed = userIdx !== -1 && userIdx <= info.minPatenteIndex

    return unitAllowed && patenteAllowed
  }

  // Filtragem por busca e unidade
  const filteredItems = items.filter(item => {
    const weapons = parseWeaponsList(item)
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          weapons.some(w => w.toLowerCase().includes(search.toLowerCase()))
    const matchesUnit = filterUnit === 'Todas' || 
                        item.allowedUnits.includes('Todas') || 
                        item.allowedUnits.includes(filterUnit)
    return matchesSearch && matchesUnit
  })

  // Helper para identificar se um registro é específico de Unidade ou Toda a Hierarquia
  function isUnitItem(item: Armamento) {
    const info = getMinPatenteInfo(item.minPatente)
    const isSpecificUnit = !item.allowedUnits.includes('Todas') && item.allowedUnits.length > 0
    return info.isAllByUnit || isSpecificUnit
  }

  // Ordenação: 
  // 1. Distribuições Gerais por Patente (do MENOR posto [Recruta] ao MAIOR [Coronel])
  // 2. Por último, Distribuições por Unidade (ex: GRR, RPM, COE, Toda a Hierarquia)
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aIsUnit = isUnitItem(a)
    const bIsUnit = isUnitItem(b)

    // Se um é de Unidade e o outro é Geral por Patente, o de Unidade fica por último
    if (!aIsUnit && bIsUnit) return -1
    if (aIsUnit && !bIsUnit) return 1

    // Se ambos forem Geral por Patente:
    if (!aIsUnit && !bIsUnit) {
      const infoA = getMinPatenteInfo(a.minPatente)
      const infoB = getMinPatenteInfo(b.minPatente)

      // Em PATENTES: Recruta = index 13 (menor posto), Coronel = index 0 (maior posto).
      // Ordenação do menor posto para o maior posto (13 -> 12 -> 11... -> 0):
      if (infoA.minPatenteIndex !== infoB.minPatenteIndex) {
        return infoB.minPatenteIndex - infoA.minPatenteIndex
      }
    }

    // Desempate alfabético por nome
    return a.name.localeCompare(b.name, 'pt-BR')
  })

  return (
    <main className="mx-auto max-w-[1400px] px-6 pb-24 pt-10 sm:px-10 lg:px-12">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 border-b border-border/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crosshair className="h-5 w-5 text-primary animate-pulse" />
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
              Material Bélico & Arsenal
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Distribuição de Armamentos por Patente</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Consulte a relação oficial de armamentos autorizados para cada patente e divisão tática da corporação.
          </p>
        </div>

        {isAltoComando && (
          <Button onClick={openCreateModal} className="w-full md:w-auto h-11 px-5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-5 w-5" /> Cadastrar por Patente
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar por patente ou armamento (ex: Glock, MP5)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-secondary/20 rounded-xl border border-border/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground"
          />
        </div>

        <div>
          <select
            value={filterUnit}
            onChange={(e) => setFilterUnit(e.target.value)}
            className="w-full px-4 py-2.5 bg-secondary/20 rounded-xl border border-border/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground"
          >
            <option value="Todas">Todas as Unidades</option>
            {UNIDADES.filter(u => u !== 'Todas').map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="text-center py-16 bg-card/20 rounded-2xl border border-border/40 p-10">
          <Crosshair className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-55" />
          <h3 className="text-lg font-semibold">Nenhum armamento encontrado</h3>
          <p className="text-xs text-muted-foreground mt-1">Nenhum registro corresponde à pesquisa ativa.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedItems.map((item) => {
            const weapons = parseWeaponsList(item)
            const minInfo = getMinPatenteInfo(item.minPatente)
            const isUnitSpecific = (!item.allowedUnits.includes('Todas') && item.allowedUnits.length > 0) || minInfo.isAllByUnit

            return (
              <div 
                key={item.id} 
                className="group relative flex flex-col md:flex-row md:items-start justify-between rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/40 hover:bg-card/60 shadow-sm"
              >
                <div className="flex-1 space-y-4">
                  {/* Patente Title & Badges */}
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">{item.name}</h2>
                    
                    {!isUnitSpecific && (
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/25">
                        {minInfo.label}
                      </span>
                    )}

                    {item.allowedUnits.length > 0 && !item.allowedUnits.includes('Todas') && (
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                        {item.allowedUnits.join(', ')}
                      </span>
                    )}

                    {minInfo.isAllByUnit && item.allowedUnits.includes('Todas') && (
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                        Toda a Hierarquia
                      </span>
                    )}
                  </div>

                  {/* Bulleted List of Weapons (Image 2 style with left vertical line) */}
                  <div className="border-l-2 border-primary/40 pl-4 py-1 space-y-2.5">
                    {weapons.map((weapon, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-sm text-foreground/90 font-medium">
                        <span className="text-primary font-bold shrink-0 mt-0.5">•</span>
                        <span>{weapon}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional Image & Actions for Alto Comando */}
                <div className="flex flex-col items-end gap-3 mt-4 md:mt-0 shrink-0">
                  {item.photoUrl && (
                    <img 
                      src={cleanImageUrl(item.photoUrl) || ''} 
                      alt={item.name}
                      className="h-20 w-32 object-cover rounded-xl border border-border/40 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {isAltoComando && (
                    <div className="flex items-center gap-2 pt-2">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => openEditModal(item)}
                        className="h-8 px-3 rounded-lg flex items-center gap-1 text-xs"
                      >
                        <Edit className="h-3.5 w-3.5" /> Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete(item.id)}
                        className="h-8 w-8 p-0 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Cadastro/Edição */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-lg rounded-2xl border border-border/60 bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-border/10 pb-3">
              <Crosshair className="h-5 w-5 text-primary" />
              {editingItem ? 'Editar Distribuição por Patente' : 'Cadastrar Distribuição de Armamento'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Título / Patente *</label>
                <input
                  type="text"
                  placeholder="Ex: Soldado, Cabo, Sargento ou superior..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border/60 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Armamentos Autorizados * (1 por linha)
                </label>
                <p className="text-[10px] text-muted-foreground">
                  Insira o nome de cada arma em uma linha separada.
                </p>
                <textarea
                  rows={5}
                  placeholder={"Pistola Glock ou Five\nSMG MP5 ou MTAR\nCarabina MK2\nG36 (ambos os modelos)"}
                  value={weaponsText}
                  onChange={(e) => setWeaponsText(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border/60 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground font-sans leading-relaxed"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">Foto / Banner Ilustrativo (Opcional)</label>
                <input
                  type="url"
                  placeholder="Link (URL) de imagem ilustrativa (Ex: https://...)"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border/60 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground"
                />
              </div>

              <div className="space-y-2 border-t border-border/10 pt-3">
                <span className="text-xs font-semibold text-foreground block">Unidades Autorizadas</span>
                <div className="flex flex-wrap gap-1.5">
                  {UNIDADES.map(unit => {
                    const active = selectedUnits.includes(unit)
                    return (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => handleUnitToggle(unit)}
                        className={`px-2.5 py-1 text-[10px] rounded border transition-colors flex items-center gap-1 ${
                          active 
                            ? 'bg-primary/10 border-primary text-primary font-bold' 
                            : 'bg-secondary/20 border-border/40 text-muted-foreground hover:bg-secondary/40'
                        }`}
                      >
                        {active && <Check className="h-3 w-3" />}
                        {unit}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2 border-t border-border/10 pt-3">
                <div>
                  <span className="text-xs font-semibold text-foreground block">Patente Mínima Exigida</span>
                  <p className="text-[10px] text-muted-foreground">
                    Selecione qual é a <strong className="text-foreground font-semibold">patente mínima</strong> para ter acesso a esta lista ou libere para toda a hierarquia.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (selectedPatentes.includes('ALL_BY_UNIT')) {
                      setSelectedPatentes(['Recruta'])
                    } else {
                      setSelectedPatentes(['ALL_BY_UNIT'])
                    }
                  }}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition-colors mb-2 flex items-center justify-between ${
                    selectedPatentes.includes('ALL_BY_UNIT')
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                      : 'bg-secondary/10 border-border/40 text-muted-foreground hover:bg-secondary/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 ${
                      selectedPatentes.includes('ALL_BY_UNIT') ? 'border-amber-400 bg-amber-400 text-black' : 'border-border'
                    }`}>
                      {selectedPatentes.includes('ALL_BY_UNIT') && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span>Toda a Hierarquia da Unidade (Sem restrição de Patente)</span>
                  </div>
                </button>

                {!selectedPatentes.includes('ALL_BY_UNIT') && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                    {PATENTES.map(pat => {
                      const info = getMinPatenteInfo(selectedPatentes)
                      const isMin = info.minPatente === pat
                      return (
                        <button
                          key={pat}
                          type="button"
                          onClick={() => setSelectedPatentes([pat])}
                          className={`px-2.5 py-1.5 text-[10px] rounded-lg border text-left transition-all flex items-center justify-between gap-1.5 ${
                            isMin 
                              ? 'bg-primary/15 border-primary text-primary font-bold shadow-sm' 
                              : 'bg-secondary/20 border-border/40 text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                          }`}
                        >
                          <span className="truncate">{pat}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-primary border border-primary/20 shrink-0 font-mono">
                            {pat}+
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-border/10 mt-6">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="flex-1 h-10 rounded-lg text-xs"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 h-10 rounded-lg text-xs font-bold"
                >
                  {submitting ? 'Salvando...' : editingItem ? 'Salvar Alterações' : 'Cadastrar Distribuição'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
