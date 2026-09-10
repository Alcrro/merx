import { Request, Response } from 'express'
import { MarketplaceService } from './marketplace.service'

const service = new MarketplaceService()

export class MarketplaceController {
  listItems = async (req: Request, res: Response) => {
    const { category, rarity, search, sort } = req.query
    const items = await service.listItems({
      category: category as string,
      rarity: rarity as string,
      search: search as string,
      sort: sort as string,
    })
    res.json({ items, total: items.length })
  }

  getItem = async (req: Request, res: Response) => {
    const item = await service.getItem(req.params.id)
    if (!item) return res.status(404).json({ error: 'Item not found' })
    res.json(item)
  }
}
