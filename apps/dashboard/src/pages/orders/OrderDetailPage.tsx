import { useNavigate, useParams } from 'react-router-dom'
import { OrderDetail } from '../../components/organisms/OrderDetail'

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return <OrderDetail orderId={id ?? ''} onBack={() => navigate('/orders')} />
}
