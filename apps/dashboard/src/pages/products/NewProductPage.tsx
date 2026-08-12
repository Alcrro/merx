import { useNavigate } from 'react-router-dom'
import { useCreateProduct, useCategories } from '../../hooks/useProducts'
import { ProductForm } from '../../components/organisms/ProductForm'

export function NewProductPage() {
  const navigate = useNavigate()
  const { mutateAsync: createProduct, isPending } = useCreateProduct()
  const { data: categories = [] } = useCategories()

  const handleSave = async (data: Parameters<typeof createProduct>[0]) => {
    const product = await createProduct(data)
    navigate(`/products/${product.id}`, { replace: true })
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate('/products')} className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200">
          ← Înapoi
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Produs nou</h1>
      </div>
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <ProductForm categories={categories} onSave={handleSave} isLoading={isPending} />
      </div>
    </div>
  )
}
