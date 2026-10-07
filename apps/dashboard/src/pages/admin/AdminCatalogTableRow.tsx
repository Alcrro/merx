import { useRef, useState } from 'react'
import type { CatalogProduct, CatalogVariant, CatalogVariantImage } from '@merx/api-client'
import {
  useAdminActivateCatalog,
  useAdminArchiveCatalog,
  useAdminGenerateVariants,
  useAdminAddVariantsBulk,
  useAdminAddVariant,
  useAdminUploadVariantImage,
  useAdminDeleteVariantImage,
} from '../../hooks/useCatalog'
import { Button } from '../../components/atoms/Button'

const STATUS_STYLES: Record<CatalogProduct['status'], string> = {
  pending: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
  active: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
  archived: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
}

type SuggestedVariant = { title: string; sku: string; suggestedPrice: number }

interface VariantImagePanelProps {
  catalogProductId: string
  variant: CatalogVariant
  onClose: () => void
}

function VariantImagePanel({ catalogProductId, variant, onClose }: VariantImagePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const upload = useAdminUploadVariantImage(catalogProductId)
  const remove = useAdminDeleteVariantImage(catalogProductId)

  const images: CatalogVariantImage[] = variant.images ?? []
  const canUpload = images.length < 10

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    await upload.mutateAsync({ variantId: variant.id, file: files[0] })
  }

  async function handleDelete(imageId: string) {
    setDeletingId(imageId)
    try {
      await remove.mutateAsync({ variantId: variant.id, imageId })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          Imagini — <span className="font-mono">{variant.title}</span>
        </p>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
          Închide
        </button>
      </div>

      {canUpload && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); void handleFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          className={[
            'flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed cursor-pointer transition py-5 px-4 text-center mb-3',
            dragOver
              ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-800/50',
          ].join(' ')}
        >
          {upload.isPending ? (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Se încarcă...</p>
          ) : (
            <>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium text-indigo-600 dark:text-indigo-400">Click</span> sau trage o imagine
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">JPEG, PNG, WebP · max 5MB · {images.length}/10</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {images.length > 0 && (
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <img src={img.url} alt={img.altText ?? ''} className="h-full w-full object-cover" />
              {img.isPrimary && (
                <span className="absolute top-0.5 left-0.5 rounded bg-indigo-600 px-1 py-0.5 text-[9px] font-semibold text-white leading-none">
                  Cover
                </span>
              )}
              <button
                onClick={() => void handleDelete(img.id)}
                disabled={!!deletingId}
                className="absolute top-0.5 right-0.5 rounded bg-black/60 p-0.5 text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-600 disabled:opacity-50"
              >
                {deletingId === img.id ? (
                  <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !canUpload && (
        <p className="text-xs text-gray-400 dark:text-gray-500">Limită atinsă — maxim 10 imagini.</p>
      )}
    </div>
  )
}

const inputCls = (err?: string) =>
  [
    'w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none transition',
    'text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800',
    'focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
    err ? 'border-red-400 dark:border-red-600' : 'border-gray-300 dark:border-gray-600',
  ].join(' ')

interface AddVariantFormProps {
  productId: string
  productTitle: string
  onClose: () => void
}

function AddVariantForm({ productId, productTitle, onClose }: AddVariantFormProps) {
  const generate = useAdminGenerateVariants(productId)
  const addBulk = useAdminAddVariantsBulk(productId)
  const addOne = useAdminAddVariant(productId)

  const [hint, setHint] = useState('')
  const [suggestions, setSuggestions] = useState<SuggestedVariant[] | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  // Manual fallback
  const [manualMode, setManualMode] = useState(false)
  const [mTitle, setMTitle] = useState('')
  const [mSku, setMSku] = useState('')
  const [mPrice, setMPrice] = useState('')
  const [mErrors, setMErrors] = useState<{ title?: string; sku?: string; price?: string }>({})

  async function handleGenerate() {
    if (!hint.trim()) return
    const result = await generate.mutateAsync(hint.trim())
    setSuggestions(result)
    setSelected(new Set(result.map((_, i) => i)))
  }

  async function handleAddSelected() {
    if (!suggestions) return
    const toAdd = suggestions.filter((_, i) => selected.has(i))
    await addBulk.mutateAsync(toAdd)
    onClose()
  }

  function toggleSuggestion(i: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i); else next.add(i)
      return next
    })
  }

  function validateManual() {
    const e: typeof mErrors = {}
    if (!mTitle.trim()) e.title = 'Obligatoriu'
    if (!mSku.trim()) e.sku = 'Obligatoriu'
    const p = parseFloat(mPrice)
    if (isNaN(p) || p < 0) e.price = 'Preț invalid'
    setMErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleManualSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validateManual()) return
    await addOne.mutateAsync({ title: mTitle.trim(), sku: mSku.trim(), suggestedPrice: parseFloat(mPrice) })
    onClose()
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/40 dark:bg-indigo-950/20 p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          {manualMode ? 'Adaugă variantă manual' : 'Generează variante cu AI'}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setManualMode((v) => !v); setSuggestions(null) }}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            {manualMode ? 'Folosește AI' : 'Adaugă manual'}
          </button>
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            Închide
          </button>
        </div>
      </div>

      {manualMode ? (
        <form onSubmit={handleManualSubmit} className="grid grid-cols-3 gap-2 items-start">
          <div>
            <input
              value={mTitle}
              onChange={(e) => { setMTitle(e.target.value); setMErrors((p) => ({ ...p, title: undefined })) }}
              placeholder="ex: Bronze / 128GB"
              className={inputCls(mErrors.title)}
              autoFocus
            />
            {mErrors.title && <p className="mt-0.5 text-[10px] text-red-500">{mErrors.title}</p>}
          </div>
          <div>
            <input
              value={mSku}
              onChange={(e) => { setMSku(e.target.value); setMErrors((p) => ({ ...p, sku: undefined })) }}
              placeholder="SKU"
              className={inputCls(mErrors.sku)}
            />
            {mErrors.sku && <p className="mt-0.5 text-[10px] text-red-500">{mErrors.sku}</p>}
          </div>
          <div>
            <input
              value={mPrice}
              onChange={(e) => { setMPrice(e.target.value); setMErrors((p) => ({ ...p, price: undefined })) }}
              placeholder="Preț (ex: 49.99)"
              type="number" min="0" step="0.01"
              className={inputCls(mErrors.price)}
            />
            {mErrors.price && <p className="mt-0.5 text-[10px] text-red-500">{mErrors.price}</p>}
          </div>
          <div className="col-span-3 flex justify-end">
            <Button size="sm" type="submit" isLoading={addOne.isPending}>Adaugă</Button>
          </div>
        </form>
      ) : (
        <>
          {/* Hint input */}
          <div className="flex gap-2">
            <input
              value={hint}
              onChange={(e) => { setHint(e.target.value); setSuggestions(null) }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleGenerate() } }}
              placeholder={`ex: Bronze, 512GB, Titan Black… (pentru ${productTitle})`}
              className={inputCls()}
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleGenerate}
              isLoading={generate.isPending}
              disabled={!hint.trim()}
            >
              Generează
            </Button>
          </div>

          {/* Suggestions */}
          {suggestions !== null && (
            <div className="mt-3">
              {suggestions.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500">AI n-a putut genera variante. Încearcă alt hint sau adaugă manual.</p>
              ) : (
                <>
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                    {suggestions.length} {suggestions.length === 1 ? 'variantă sugerată' : 'variante sugerate'} — selectează ce vrei să adaugi:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {suggestions.map((v, i) => {
                      const isSelected = selected.has(i)
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleSuggestion(i)}
                          className={[
                            'flex flex-col items-start rounded-lg border p-3 text-left transition-all',
                            isSelected
                              ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 shadow-sm'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 opacity-50',
                          ].join(' ')}
                        >
                          <div className="mb-1.5 flex w-full items-center justify-between">
                            <span className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-colors ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}>
                              {isSelected && (
                                <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="currentColor">
                                  <path fillRule="evenodd" d="M10.293 2.293a1 1 0 011.414 1.414l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L5 7.586l5.293-5.293z" clipRule="evenodd" />
                                </svg>
                              )}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">{v.sku}</span>
                          </div>
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">{v.title}</p>
                          <p className="mt-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">{v.suggestedPrice.toFixed(2)} €</p>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelected(new Set(suggestions.map((_, i) => i)))}
                      className="text-xs text-indigo-500 dark:text-indigo-400 hover:underline"
                    >
                      Selectează toate
                    </button>
                    <Button
                      size="sm"
                      onClick={handleAddSelected}
                      isLoading={addBulk.isPending}
                      disabled={selected.size === 0}
                    >
                      Adaugă {selected.size > 0 ? `${selected.size} ` : ''}{selected.size === 1 ? 'variantă' : 'variante'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

interface Props {
  product: CatalogProduct
}

export function AdminCatalogTableRow({ product }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [addingVariant, setAddingVariant] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  const activate = useAdminActivateCatalog()
  const archive = useAdminArchiveCatalog()

  const variants = product.variants ?? []
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null

  return (
    <>
      <tr
        className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900 dark:text-gray-100 leading-tight">{product.title}</p>
            {product.aiGenerated && (
              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800">
                AI
              </span>
            )}
          </div>
          {product.description && (
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 line-clamp-1 max-w-xs">{product.description}</p>
          )}
        </td>
        <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400">
          {product.category?.name ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
        </td>
        <td className="px-4 py-3.5 text-sm tabular-nums text-gray-500 dark:text-gray-400">
          {variants.length}
        </td>
        <td className="px-4 py-3.5 text-sm tabular-nums text-gray-500 dark:text-gray-400">
          {product.storeCount ?? 0}
        </td>
        <td className="px-4 py-3.5">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[product.status]}`}>
            {product.status}
          </span>
        </td>
        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
          {product.status !== 'archived' && (
            confirmArchive ? (
              <div className="flex items-center justify-end gap-2">
                <button
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  onClick={() => setConfirmArchive(false)}
                >
                  Anulează
                </button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                  isLoading={archive.isPending}
                  onClick={async () => {
                    await archive.mutateAsync(product.id)
                    setConfirmArchive(false)
                  }}
                >
                  Confirmă
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3">
                {product.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40"
                    isLoading={activate.isPending}
                    onClick={() => activate.mutate(product.id)}
                  >
                    Activează
                  </Button>
                )}
                <button
                  className="text-xs text-red-500 dark:text-red-400 hover:underline"
                  onClick={() => setConfirmArchive(true)}
                >
                  Arhivează
                </button>
              </div>
            )
          )}
        </td>
        <td className="px-4 py-3.5 w-8">
          <svg
            className={`ml-auto h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20" fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={7} className="px-4 pb-4 pt-0">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 p-4">

              {/* Add variant form */}
              {addingVariant ? (
                <div className="mb-3">
                  <AddVariantForm
                    productId={product.id}
                    productTitle={product.title}
                    onClose={() => setAddingVariant(false)}
                  />
                </div>
              ) : null}

              {/* Image management panel for selected variant */}
              {!addingVariant && selectedVariant && (
                <div className="mb-3">
                  <VariantImagePanel
                    catalogProductId={product.id}
                    variant={selectedVariant}
                    onClose={() => setSelectedVariantId(null)}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {/* + card */}
                {!addingVariant && (
                  product.status === 'active' ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setAddingVariant(true) }}
                      className="flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-3 text-gray-400 dark:text-gray-500 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors min-h-[88px]"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium">Adaugă variantă</span>
                    </button>
                  ) : (
                    <div
                      title={product.status === 'pending' ? 'Activează produsul înainte de a adăuga variante' : 'Produsul arhivat nu poate primi variante noi'}
                      className="flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3 text-gray-300 dark:text-gray-600 cursor-not-allowed min-h-[88px]"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium">Adaugă variantă</span>
                      <span className="text-[10px] text-center leading-tight">
                        {product.status === 'pending' ? 'Activează produsul mai întâi' : 'Produs arhivat'}
                      </span>
                    </div>
                  )
                )}

                {/* Existing variants */}
                {variants.map((v) => {
                  const primaryImage = v.images?.find((img) => img.isPrimary) ?? v.images?.[0]
                  const isSelected = selectedVariantId === v.id
                  return (
                    <div
                      key={v.id}
                      className={[
                        'flex flex-col items-start rounded-lg border bg-white dark:bg-gray-900',
                        isSelected
                          ? 'border-indigo-400 dark:border-indigo-500 ring-1 ring-indigo-300 dark:ring-indigo-700'
                          : 'border-gray-200 dark:border-gray-700',
                      ].join(' ')}
                    >
                      {/* Image thumbnail */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setAddingVariant(false)
                          setSelectedVariantId(isSelected ? null : v.id)
                        }}
                        className="w-full aspect-square rounded-t-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:opacity-80 transition relative"
                        title="Gestionează imagini"
                      >
                        {primaryImage ? (
                          <img src={primaryImage.url} alt={primaryImage.altText ?? v.title} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="h-5 w-5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                        {v.images && v.images.length > 0 && (
                          <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white font-medium">
                            {v.images.length}
                          </span>
                        )}
                      </button>
                      {/* Info */}
                      <div className="p-2.5 w-full">
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">{v.title}</p>
                        <p className="mt-0.5 text-[10px] font-mono text-gray-400 dark:text-gray-500">{v.sku}</p>
                        <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {v.suggestedPrice.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {variants.length === 0 && !addingVariant && (
                <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">Nicio variantă existentă.</p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
