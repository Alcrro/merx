import type { Order } from '../../domain/entities/order.entity'
import type { OrderResponseDto } from '../dto/order.dto'

export function toOrderResponse(order: Order): OrderResponseDto {
  return {
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }
}
