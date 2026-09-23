import { useMemo, useState } from 'react'
import {
  ArrowDownUp,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderOpen,
  Image,
  Presentation,
  Search,
  Star,
} from 'lucide-react'
import { Badge, GlassCard, Modal, PageHeader } from '../components/ui'
import { useData } from '../providers/DataProvider'
import { useToast } from '../providers/ToastProvider'
import { DOCUMENT_FOLDERS } from '../data/demo'
import { formatDate } from '../utils/dates'
import { cn } from '../utils/cn'
import type { DocFile } from '../types'

const kindIcons = {
  pdf: FileText,
  image: Image,
  doc: FileText,
  sheet: FileSpreadsheet,
  slide: Presentation,
  other: FileText,
}

type SortKey = 'name' | 'date' | 'size'

export function DocumentsPage() {
  const { documents, toggleDocFavorite } = useData()
  const toast = useToast()
  const [folder, setFolder] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('date')
  const [preview, setPreview] = useState<DocFile | null>(null)
  const [onlyFav, setOnlyFav] = useState(false)

  const visible = useMemo(() => {
    let list = documents
    if (folder !== 'all') list = list.filter((d) => d.folder === folder)
    if (onlyFav) list = list.filter((d) => d.favorite)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.folder.toLowerCase().includes(q) ||
          (d.subject ?? '').toLowerCase().includes(q),
      )
    }
    const sizeVal = (s: string) => {
      const n = parseFloat(s.replace(',', '.'))
      return s.includes('Mo') ? n * 1024 : n
    }
    return [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'size') return sizeVal(b.size) - sizeVal(a.size)
      return b.updatedAt.localeCompare(a.updatedAt)
    })
  }, [documents, folder, query, sort, onlyFav])

  const folders = useMemo(() => {
    const counts = new Map<string, number>()
    documents.forEach((d) => counts.set(d.folder, (counts.get(d.folder) ?? 0) + 1))
    return DOCUMENT_FOLDERS.map((f) => ({ name: f, count: counts.get(f) ?? 0 }))
  }, [documents])

  return (
    <div className="page-enter">
      <PageHeader
        title="Documents"
        subtitle="Supports de cours, administration et fichiers partagés."
        actions={
          <div className="glass-subtle flex items-center gap-2 rounded-2xl px-3 py-2">
            <ArrowDownUp className="size-3.5 text-ink-3" aria-hidden />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Trier"
              className="bg-transparent text-xs font-medium text-ink outline-none"
            >
              <option value="date">Date</option>
              <option value="name">Nom</option>
              <option value="size">Taille</option>
            </select>
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un fichier…"
            aria-label="Rechercher un document"
            className="h-11 w-full rounded-2xl border border-line-soft bg-surface-strong pr-4 pl-10 text-sm text-ink placeholder:text-ink-3 focus:border-accent/50 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setOnlyFav((v) => !v)}
          className={cn(
            'inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition',
            onlyFav
              ? 'border-accent/40 bg-accent-softer text-accent'
              : 'border-line-soft bg-surface-strong text-ink-2 hover:bg-surface-hover',
          )}
          aria-pressed={onlyFav}
        >
          <Star className={cn('size-4', onlyFav && 'fill-current')} aria-hidden />
          Favoris
        </button>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar" role="tablist" aria-label="Dossiers">
        <button
          type="button"
          role="tab"
          aria-selected={folder === 'all'}
          onClick={() => setFolder('all')}
          className={cn(
            'glass-subtle inline-flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-medium transition',
            folder === 'all' ? 'bg-accent text-accent-contrast' : 'text-ink-2 hover:bg-surface-hover',
          )}
        >
          <FolderOpen className="size-4" aria-hidden />
          Tous
          <span className="text-xs opacity-70">{documents.length}</span>
        </button>
        {folders.map((f) => (
          <button
            key={f.name}
            type="button"
            role="tab"
            aria-selected={folder === f.name}
            onClick={() => setFolder(f.name)}
            className={cn(
              'glass-subtle inline-flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-medium transition',
              folder === f.name ? 'bg-accent text-accent-contrast' : 'text-ink-2 hover:bg-surface-hover',
            )}
          >
            <Folder className="size-4" aria-hidden />
            {f.name}
            <span className="text-xs opacity-70">{f.count}</span>
          </button>
        ))}
      </div>

      <div className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((d) => {
          const Icon = kindIcons[d.kind]
          return (
            <GlassCard key={d.id} interactive className="group p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-softer text-accent">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink" title={d.name}>
                    {d.name}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-3">
                    {d.folder}
                    {d.subject ? ` · ${d.subject}` : ''} · {d.size}
                  </p>
                  <p className="text-[11px] text-ink-3">Modifié {formatDate(d.updatedAt)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDocFavorite(d.id)}
                  aria-label={d.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  aria-pressed={d.favorite}
                  className={cn(
                    'rounded-xl p-2 transition',
                    d.favorite ? 'text-warning' : 'text-ink-3 opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
                  )}
                >
                  <Star className={cn('size-4', d.favorite && 'fill-current')} />
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreview(d)}
                  className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-xl border border-line-soft bg-surface-strong text-xs font-medium text-ink-2 transition hover:bg-surface-hover"
                >
                  <Eye className="size-3.5" aria-hidden />
                  Aperçu
                </button>
                <button
                  type="button"
                  onClick={() => toast.info('Téléchargement simulé', `${d.name} — démo locale.`)}
                  className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-xl border border-line-soft bg-surface-strong text-xs font-medium text-ink-2 transition hover:bg-surface-hover"
                >
                  <Download className="size-3.5" aria-hidden />
                  Télécharger
                </button>
              </div>
            </GlassCard>
          )
        })}
      </div>

      {visible.length === 0 && (
        <div className="glass rounded-3xl px-6 py-14 text-center">
          <FolderOpen className="mx-auto mb-3 size-8 text-ink-3" aria-hidden />
          <p className="font-semibold text-ink">Aucun document</p>
          <p className="mt-1 text-sm text-ink-3">Essayez un autre dossier ou une autre recherche.</p>
        </div>
      )}

      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.name ?? ''}
        wide
        footer={
          <>
            <Badge>{preview?.size}</Badge>
            <button
              type="button"
              onClick={() => preview && toggleDocFavorite(preview.id)}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-line-soft px-4 text-sm text-ink-2 hover:bg-surface-hover"
            >
              <Star className={cn('size-4', preview?.favorite && 'fill-current text-warning')} aria-hidden />
              Favori
            </button>
          </>
        }
      >
        {preview && (
          <div className="space-y-4">
            <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-line-soft bg-gradient-to-br from-surface-strong to-surface">
              <div className="text-center">
                <FileText className="mx-auto size-12 text-accent/60" aria-hidden />
                <p className="mt-3 text-sm font-medium text-ink">Aperçu du document</p>
                <p className="text-xs text-ink-3">Rendu de démonstration — fichier fictif</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-ink-3">Dossier</dt>
                <dd className="font-medium text-ink">{preview.folder}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-3">Taille</dt>
                <dd className="font-medium text-ink">{preview.size}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-3">Modifié le</dt>
                <dd className="font-medium text-ink">{formatDate(preview.updatedAt, { long: true })}</dd>
              </div>
              {preview.subject && (
                <div>
                  <dt className="text-xs text-ink-3">Matière</dt>
                  <dd className="font-medium text-ink">{preview.subject}</dd>
                </div>
              )}
            </dl>
            {preview.description && (
              <p className="text-sm text-ink-2">{preview.description}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
