import { User, CreateUserDTO, UpdateUserDTO } from '../models/User'
import { IRepository, IQueryOptions, IPaginatedResult } from './IRepository'

export interface IUserRepository extends IRepository<User> {
  createWithAuth(data: CreateUserDTO): Promise<User>
  findByEmail(email: string): Promise<User | null>
  updateProfile(userId: string, data: UpdateUserDTO): Promise<User>
  deactivate(userId: string): Promise<void>
  activate(userId: string): Promise<void>
  query(options: IQueryOptions<User>): Promise<User[]>
  queryPaginated(
    options: IQueryOptions<User>,
  ): Promise<IPaginatedResult<User>>
  exists(userId: string): Promise<boolean>
}