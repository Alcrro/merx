import { useNavigate, useParams } from 'react-router-dom'
import {
  useProduct, useUpdateProduct, useCategories,
  useCreateVariant, useUpdateVariant, useDeleteVariant,
} from '../../hooks/useProducts'
import { ProductForm } from '../../components/organisms/ProductForm'
import { VariantsList } from '../../components/organisms/VariantsList'
import { StatusBadge } from '../../components/atoms/Badge'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading } = useProduct(id!)
  const { data: categories = [] } = useCategories()
  const { mutateAsync: updateProduct, isPending: isSaving } = useUpdateProduct(id!)
  const { mutateAsync: createVariant, isPending: isAdding } = useCreateVariant(id!)
  const { mutateAsync: updateVariant, isPending: isUpdating } = useUpdateVariant(id!)
  const { mutateAsync: deleteVariant, isPending: isDeleting } = useDeleteVariant(id!)

  if (isLoading) {
    return <div className="flex items-center justify-center py-32 text-sm text-gray-400 dark:text-gray-500">Se încarcă...</div>
  }

  if (!product) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Produsul nu a fost găsit.</div>
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate('/products')} className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200">
          ← Înapoi
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{product.title}</h1>
        <StatusBadge status={product.status} />
      </div>

      <div className="flex flex-col gap-5">
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
