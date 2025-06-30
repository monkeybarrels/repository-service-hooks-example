import { IUserService, UserStats } from '@interfaces/services/IUserService'
import { IUserRepository } from '@interfaces/repositories/IUserRepository'
import { User, UpdateUserDTO, UserRole } from '@interfaces/models/User'
import { IQueryOptions, IPaginatedResult } from '@interfaces/repositories/IRepository'

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async getUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new Error(`User with id ${userId} not found`)
    }
    return user
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw new Error(`User with email ${email} not found`)
    }
    return user
  }

  async updateUser(userId: string, data: UpdateUserDTO): Promise<User> {
    const exists = await this.userRepository.exists(userId)
    if (!exists) {
      throw new Error(`User with id ${userId} not found`)
    }

    return await this.userRepository.updateProfile(userId, data)
  }

  async deleteUser(userId: string): Promise<void> {
    const exists = await this.userRepository.exists(userId)
    if (!exists) {
      throw new Error(`User with id ${userId} not found`)
    }

    await this.userRepository.delete(userId)
  }

  async deactivateUser(userId: string): Promise<void> {
    const exists = await this.userRepository.exists(userId)
    if (!exists) {
      throw new Error(`User with id ${userId} not found`)
    }

    await this.userRepository.deactivate(userId)
  }

  async activateUser(userId: string): Promise<void> {
    const exists = await this.userRepository.exists(userId)
    if (!exists) {
      throw new Error(`User with id ${userId} not found`)
    }

    await this.userRepository.activate(userId)
  }

  async changeUserRole(userId: string, role: UserRole): Promise<User> {
    const user = await this.getUser(userId)
    
    return await this.userRepository.updateProfile(userId, {
      metadata: {
        ...user.metadata,
        role,
      },
    })
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    const normalizedTerm = searchTerm.toLowerCase().trim()
    
    if (normalizedTerm.includes('@')) {
      const users = await this.userRepository.query({
        where: [
          {
            field: 'email',
            operator: '==',
            value: normalizedTerm,
          },
        ],
      })
      return users
    }

    const allUsers = await this.userRepository.findAll()
    return allUsers.filter((user) => {
      const searchableFields = [
        user.email.toLowerCase(),
        user.displayName?.toLowerCase() || '',
      ]
      return searchableFields.some((field) => field.includes(normalizedTerm))
    })
  }

  async listUsers(
    options?: IQueryOptions<User>,
  ): Promise<IPaginatedResult<User>> {
    const defaultOptions: IQueryOptions<User> = {
      orderBy: {
        field: 'createdAt',
        direction: 'desc',
      },
      limit: 10,
      ...options,
    }

    return await this.userRepository.queryPaginated(defaultOptions)
  }

  async getUserStats(): Promise<UserStats> {
    const allUsers = await this.userRepository.findAll()
    
    const stats: UserStats = {
      totalUsers: allUsers.length,
      activeUsers: 0,
      inactiveUsers: 0,
      usersByRole: {
        admin: 0,
        user: 0,
        guest: 0,
      },
      recentSignups: 0,
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    allUsers.forEach((user) => {
      if (user.metadata?.isActive) {
        stats.activeUsers++
      } else {
        stats.inactiveUsers++
      }

      const role = user.metadata?.role || 'user'
      stats.usersByRole[role]++

      if (user.createdAt >= thirtyDaysAgo) {
        stats.recentSignups++
      }
    })

    return stats
  }
}