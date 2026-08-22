export class CatalogError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'CONFLICT' | 'INVALID' | 'FORBIDDEN'
  ) {
    super(message)
    this.name = 'CatalogError'
  }
}

export class CatalogVariantImageError extends Error {
  constructor(message: string, public readonly code: 'NOT_FOUND' | 'INVALID' | 'LIMIT_EXCEEDED') {
    super(message)
    this.name = 'CatalogVariantImageError'
  }
}

export class ArchiveCriteriaError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'CONFLICT'
  ) {
    super(message)
    this.name = 'ArchiveCriteriaError'
  }
}
