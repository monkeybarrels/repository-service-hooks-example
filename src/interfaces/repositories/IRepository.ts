export interface IRepository<T> {
  create(data: Partial<T>): Promise<T>
  findById(id: string): Promise<T | null>
  findAll(): Promise<T[]>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}

export interface IQueryOptions<T> {
  where?: Array<{
    field: keyof T
    operator: WhereFilterOp
    value: unknown
  }>
  orderBy?: {
    field: keyof T
    direction: 'asc' | 'desc'
  }
  limit?: number
  startAfter?: unknown
}

export type WhereFilterOp =
  | '<'
  | '<='
  | '=='
  | '!='
  | '>='
  | '>'
  | 'array-contains'
  | 'array-contains-any'
  | 'in'
  | 'not-in'

export interface IPaginatedResult<T> {
  data: T[]
  total: number
  hasMore: boolean
  lastDoc?: unknown
}