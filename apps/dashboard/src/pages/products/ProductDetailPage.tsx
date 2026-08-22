import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useProduct, useUpdateProduct, useCategories,
  useCreateVariant, useUpdateVariant, useDeleteVariant,
  useProductAnalytics, useUploadImage, useDeleteImage,
} from '../../hooks/useProducts'
import { useAuth } from '../../hooks/useAuth'
import { ProductForm } from '../../components/organisms/products/ProductForm'
import { VariantsList } from '../../components/organisms/products/VariantsList'
import { ProductSalesChart } from '../../components/organisms/products/ProductSalesChart'
import { ImageUploader } from '../../components/organisms/products/ImageUploader'
import { StatusBadge } from '../../components/atoms/Badge'

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function SectionSkeleton({ h = 'h-40' }: { h?: string }) {
  return <div className={`${h} animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800`} />
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { store } = useAuth()
  const { data: product, isLoading } = useProduct(id!)
  const { data: analytics, isLoading: analyticsLoading } = useProductAnalytics(id!)
  const { data: categories = [] } = useCategories()
  const { mutateAsync: updateProduct, isPending: isSaving } = useUpdateProduct(id!)
  const { mutateAsync: createVariant, isPending: isAdding } = useCreateVariant(id!)
  const { mutateAsync: updateVariant, isPending: isUpdating } = useUpdateVariant(id!)
  const { mutateAsync: deleteVariant, isPending: isDeleting } = useDeleteVariant(id!)
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadImage(id!)
  const { mutateAsync: deleteImage, isPending: isDeletingImage } = useDeleteImage(id!)

  const fmt = useMemo(
    () => new Intl.NumberFormat('ro-RO', { style: 'currency', currency: store?.currency ?? 'EUR', maximumFractionDigits: 0 }),
    [store?.currency]
  )

  if (isLoading) {
    return <div className="flex items-center justify-center py-32 text-sm text-gray-400 dark:text-gray-500">Se încarcă...</div>
  }

  if (!product) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Produsul nu a fost găsit.</div>
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/products')} className="mb-3 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition">
          ← Produse
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{product.title}</h1>
          <StatusBadge status={product.status} />
          {product.brand?.name && (
            <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              {product.brand.name}
            </span>
          )}
          {product.productType && (
            <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs text-gray-400 dark:text-gray-500">
              {product.productType}
            </span>
          )}
        </div>
      </div>

      {/* KPI — All time */}
      {analyticsLoading ? (
        <SectionSkeleton h="h-20" />
      ) : analytics && (
        <>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">All time</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard label="Revenue" value={fmt.format(analytics.totals.revenue)} />
              <KpiCard label="Profit" value={fmt.format(analytics.totals.profit)} sub={`Marjă ${analytics.totals.margin}%`} />
              <KpiCard label="Unități vândute" value={analytics.totals.unitsSold.toString()} />
              <KpiCard label="Comenzi" value={analytics.totals.orders.toString()} />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Ultimele 30 zile</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard label="Revenue" value={fmt.format(analytics.last30d.revenue)} />
              <KpiCard label="Profit" value={fmt.format(analytics.last30d.profit)} />
              <KpiCard label="Unități vândute" value={analytics.last30d.unitsSold.toString()} />
              <KpiCard label="Comenzi" value={analytics.last30d.orders.toString()} />
            </div>
          </div>
        </>
      )}

      {/* Sales chart */}
      <ProductSalesChart data={analytics?.monthlySales} fmt={fmt} isLoading={analyticsLoading} />

      {/* Variant performance */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Performanță variante</h2>
        </div>
        {analyticsLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-5 animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />)}
          </div>
        ) : analytics && analytics.variantStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Variantă</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">SKU</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Preț</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Unități</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Revenue</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Profit</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Stoc</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Top oraș</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Top țară</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {analytics.variantStats.map((v) => (
                  <tr key={v.variantId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{v.title}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400 dark:text-gray-500">{v.sku}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">{fmt.format(v.price)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">{v.unitsSold}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-gray-900 dark:text-gray-100">{fmt.format(v.revenue)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">{fmt.format(v.profit)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className={v.currentStock === 0 ? 'text-red-500 font-semibold' : v.currentStock <= 5 ? 'text-amber-500 font-medium' : 'text-gray-700 dark:text-gray-300'}>
                        {v.currentStock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {v.topCity ? (
                        <span title={`${v.topCityOrders} comenzi`}>{v.topCity}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {v.topCountry ? (
                        <span title={`${v.topCountryOrders} comenzi`}>{v.topCountry}</span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-sm text-gray-400 dark:text-gray-500">Nicio variantă cu vânzări.</div>
        )}
      </div>

      {/* Geo + Buyers */}
      {analyticsLoading ? (
        <SectionSkeleton h="h-48" />
      ) : analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top cities */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Top orașe</p>
            {analytics.geo.cities.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">Date insuficiente.</p>
            ) : (
              <div className="space-y-2">
                {analytics.geo.cities.map((c) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{c.name}</span>
                    <span className="text-sm font-medium tabular-nums text-gray-500 dark:text-gray-400">{c.orders} comenzi</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top countries */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Top țări</p>
            {analytics.geo.countries.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">Date insuficiente.</p>
            ) : (
              <div className="space-y-2">
                {analytics.geo.countries.map((c) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{c.name}</span>
                    <span className="text-sm font-medium tabular-nums text-gray-500 dark:text-gray-400">{c.orders} comenzi</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buyers */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Cumpărători</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Clienți unici</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{analytics.buyers.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Cumpărători repetați</span>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{analytics.buyers.repeatBuyers}</span>
                  <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">({analytics.buyers.repeatRate}%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">LTV mediu cumpărători</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{fmt.format(analytics.buyers.avgBuyerLtv)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Frequently bought together */}
      {(analyticsLoading || (analytics && analytics.frequentlyBoughtWith.length > 0)) && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Frecvent cumpărate împreună</h2>
          </div>
          {analyticsLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-5 animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Produs</th>
                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Comenzi împreună</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {analytics!.frequentlyBoughtWith.map((p) => (
                    <tr
                      key={p.productId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => navigate(`/products/${p.productId}`)}
                    >
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.title}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-gray-900 dark:text-gray-100">{p.coOrders}×</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Images */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Imagini produs</h2>
        <ImageUploader
          images={product.images ?? []}
          onUpload={async (file) => { await uploadImage(file) }}
          onDelete={async (imageId) => { await deleteImage(imageId) }}
          isUploading={isUploading}
          isDeleting={isDeletingImage}
        />
      </div>

      {/* Product form + Variants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Detalii produs</h2>
          <ProductForm
            initial={product}
            categories={categories}
            onSave={async (data) => { await updateProduct(data) }}
            isLoading={isSaving}
          />
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <VariantsList
            productId={id!}
            variants={product.variants ?? []}
            onAdd={async (data) => { await createVariant(data) }}
            onUpdate={async (variantId, data) => { await updateVariant({ variantId, data }) }}
            onDelete={async (variantId) => { await deleteVariant(variantId) }}
            isAdding={isAdding}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  )
}
