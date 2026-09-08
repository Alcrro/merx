import { useState } from 'react'
import { CatalogTable } from '../../components/organisms/catalog/CatalogTable'
import { RequestProductModal } from '../../components/organisms/catalog/RequestProductModal'
import { Button } from '../../components/atoms/Button'

export function CatalogPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Catalog global</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Adaugă produse din catalogul platformei în store-ul tău.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>Cere produs nou</Button>
      </div>

      <CatalogTable onRequestProduct={() => setShowModal(true)} />

      {showModal && <RequestProductModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
