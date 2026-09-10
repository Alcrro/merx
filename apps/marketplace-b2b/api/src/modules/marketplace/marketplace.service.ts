interface ListFilters {
  category?: string
  rarity?: string
  search?: string
  sort?: string
}

export class MarketplaceService {
  async listItems(_filters: ListFilters) {
    // TODO: DB query
    return []
  }

  async getItem(_id: string) {
    // TODO: DB query
    return null
  }
}
