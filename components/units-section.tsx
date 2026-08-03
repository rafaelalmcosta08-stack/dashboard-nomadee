import Image from 'next/image'
import { units } from '@/lib/site-data'
import { CometCard } from '@/components/ui/comet-card'

export function UnitsSection() {
  return (
    <section id="unidades" className="mx-auto max-w-[1600px] px-6 py-20 sm:px-10 lg:px-16 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Nossas Unidades
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          Conheça as diferentes unidades do Departamento de Polícia integradas à Nômade e suas responsabilidades
          na manutenção da segurança pública.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {units.map((unit) => {
          const Icon = unit.icon
          return (
            <CometCard
              key={unit.sigla}
              containerClassName="h-full"
              className="flex h-full flex-col justify-between rounded-[20px] bg-[#1F2121] p-3 md:p-4 border border-white/10 hover:border-blue-500/40 transition-colors shadow-2xl"
              cometColor="rgba(59, 130, 246, 0.9)"
              glowColor="rgba(59, 130, 246, 0.2)"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Top Header Badge & Title */}
                  <div className="flex items-center justify-between mb-3 px-1 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight">
                          {unit.sigla}
                        </h3>
                        <p className="text-[11px] font-mono text-zinc-400">
                          {unit.nome}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-blue-400 opacity-80">
                      #{unit.sigla}
                    </span>
                  </div>

                  {/* Main Image Banner matching the Comet Card Demo style */}
                  <div className="relative mt-2 aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-[#000000]">
                    {unit.image ? (
                      <Image
                        src={unit.image || '/placeholder.svg'}
                        alt={`Unidade ${unit.sigla} - ${unit.nome}`}
                        fill
                        unoptimized
                        className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-zinc-900">
                        <Icon className="h-10 w-10 text-zinc-600" />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-3 px-1 text-xs leading-relaxed text-zinc-300 font-sans">
                    {unit.descricao}
                  </p>
                </div>

                {/* Footer Bar matching Comet Card demo */}
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 px-1 font-mono text-white">
                  <div className="text-xs font-semibold text-zinc-200">{unit.sigla} Division</div>
                  <div className="text-[11px] text-blue-400 font-mono">NÔMADE v3.5</div>
                </div>
              </div>
            </CometCard>
          )
        })}
      </div>
    </section>
  )
}


