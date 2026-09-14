import { useNavigate, useParams } from 'react-router-dom'
import OrderDetail from '../../components/organisms/orders/OrderDetail'

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return <OrderDetail orderSlug={id ?? ''} onBack={() => navigate('/orders')} />
}
