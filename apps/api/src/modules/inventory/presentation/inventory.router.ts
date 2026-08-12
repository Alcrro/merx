import { Router } from 'express'
import { authenticate, withAuth } from '../../../middleware/authenticate'
import { inventoryController } from './inventory.controller'

const router = Router()
router.use(authenticate)

router.get('/', withAuth(inventoryController.list))
router.get('/:variantId', withAuth(inventoryController.get))
router.post('/:variantId/adjust', withAuth(inventoryController.adjust))
router.patch('/:variantId/reorder-point', withAuth(inventoryController.updateReorderPoint))
router.get('/:variantId/movements', withAuth(inventoryController.listMovements))

export { router as inventoryRouter }
