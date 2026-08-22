export interface CatalogCategoryEntity {
  id: string
  name: string
  slug: string
  parentId: string | null
  parent?: CatalogCategoryEntity | null
  children?: CatalogCategoryEntity[]
}
