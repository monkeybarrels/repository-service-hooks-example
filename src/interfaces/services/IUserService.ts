import { User, UpdateUserDTO, UserRole } from '../models/User'
import { IQueryOptions, IPaginatedResult } from '../repositories/IRepository'

export interface IUserService {
  getUser(userId: string): Promise<User>
  getUserByEmail(email: string): Promise<User>
  updateUser(userId: string, data: UpdateUserDTO): Promise<User>
  deleteUser(userId: string): Promise<void>
  deactivateUser(userId: string): Promise<void>
  activateUser(userId: string): Promise<void>
  changeUserRole(userId: string, role: UserRole): Promise<User>
  searchUsers(searchTerm: string): Promise<User[]>
  listUsers(options?: IQueryOptions<User>): Promise<IPaginatedResult<User>>
  getUserStats(): Promise<UserStats>
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  usersByRole: Record<UserRole, number>
  recentSignups: number
}