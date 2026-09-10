import { Router } from 'express'
import { MarketplaceController } from './marketplace.controller'

const controller = new MarketplaceController()
export const marketplaceRouter = Router()

marketplaceRouter.get('/items', controller.listItems)
marketplaceRouter.get('/items/:id', controller.getItem)
