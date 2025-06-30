import { IUserRepository } from '@interfaces/repositories/IUserRepository'
import { User, CreateUserDTO, UpdateUserDTO, UserMetadata } from '@interfaces/models/User'
import { IQueryOptions, IPaginatedResult } from '@interfaces/repositories/IRepository'
import { ValidationError, NotFoundError } from '@utils/errors'

export class LocalStorageUserRepository implements IUserRepository {
  private readonly STORAGE_KEY = 'servicehooks_users'
  private readonly CURRENT_USER_KEY = 'servicehooks_current_user'

  private getUsers(): User[] {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return []
    
    const users = JSON.parse(stored)
    // Convert date strings back to Date objects
    return users.map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      metadata: {
        ...user.metadata,
        lastLoginAt: user.metadata?.lastLoginAt ? new Date(user.metadata.lastLoginAt) : undefined,
      },
    }))
  }

  private saveUsers(users: User[]): void {
    // Dates will be automatically serialized to strings
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users))
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getCurrentUser(): User | null {
    const stored = localStorage.getItem(this.CURRENT_USER_KEY)
    return stored ? JSON.parse(stored) : null
  }

  private setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(this.CURRENT_USER_KEY)
    }
  }

  async create(data: Partial<User>): Promise<User> {
    const users = this.getUsers()
    const id = data.id || this.generateId()
    const now = new Date()

    if (data.email && users.some(u => u.email === data.email)) {
      throw new ValidationError('Email already exists')
    }

    const user: User = {
      id,
      email: data.email || '',
      displayName: data.displayName || null,
      photoURL: data.photoURL || null,
      emailVerified: data.emailVerified || false,
      createdAt: now,
      updatedAt: now,
      metadata: {
        isActive: true,
        role: 'user',
        ...data.metadata,
      } as UserMetadata,
    }

    users.push(user)
    this.saveUsers(users)
    return user
  }

  async findById(id: string): Promise<User | null> {
    const users = this.getUsers()
    return users.find(user => user.id === id) || null
  }

  async findAll(): Promise<User[]> {
    return this.getUsers()
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const users = this.getUsers()
    const index = users.findIndex(user => user.id === id)

    if (index === -1) {
      throw new NotFoundError('User')
    }

    const updatedUser: User = {
      ...users[index],
      ...data,
      id,
      updatedAt: new Date(),
    }

    users[index] = updatedUser
    this.saveUsers(users)

    // Update current user if it's the same user
    const currentUser = this.getCurrentUser()
    if (currentUser && currentUser.id === id) {
      this.setCurrentUser(updatedUser)
    }

    return updatedUser
  }

  async delete(id: string): Promise<void> {
    const users = this.getUsers()
    const filteredUsers = users.filter(user => user.id !== id)

    if (filteredUsers.length === users.length) {
      throw new NotFoundError('User')
    }

    this.saveUsers(filteredUsers)

    // Clear current user if it's the deleted user
    const currentUser = this.getCurrentUser()
    if (currentUser && currentUser.id === id) {
      this.setCurrentUser(null)
    }
  }

  async createWithAuth(data: CreateUserDTO): Promise<User> {
    // Simulate password validation
    if (!data.password || data.password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long')
    }

    const user = await this.create({
      email: data.email,
      displayName: data.displayName,
      emailVerified: false,
      metadata: {
        isActive: true,
        role: 'user',
        lastLoginAt: new Date(),
        signInProvider: 'password',
      },
    })

    // Store password hash (in real app, use proper hashing)
    const hashedPassword = btoa(data.password) // Simple base64 for demo
    localStorage.setItem(`password_${user.id}`, hashedPassword)

    this.setCurrentUser(user)
    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = this.getUsers()
    return users.find(user => user.email === email) || null
  }

  async updateProfile(userId: string, data: UpdateUserDTO): Promise<User> {
    const updateData: Partial<User> = {
      displayName: data.displayName,
      photoURL: data.photoURL,
    }
    
    if (data.metadata) {
      const existingUser = await this.findById(userId)
      if (existingUser) {
        updateData.metadata = {
          ...existingUser.metadata,
          ...data.metadata,
        } as UserMetadata
      }
    }
    
    return await this.update(userId, updateData)
  }

  async deactivate(userId: string): Promise<void> {
    const user = await this.findById(userId)
    if (!user) {
      throw new NotFoundError('User')
    }

    await this.update(userId, {
      metadata: {
        ...user.metadata,
        isActive: false,
      } as UserMetadata,
    })
  }

  async activate(userId: string): Promise<void> {
    const user = await this.findById(userId)
    if (!user) {
      throw new NotFoundError('User')
    }

    await this.update(userId, {
      metadata: {
        ...user.metadata,
        isActive: true,
      } as UserMetadata,
    })
  }

  async query(options: IQueryOptions<User>): Promise<User[]> {
    let users = this.getUsers()

    // Apply where conditions
    if (options.where) {
      options.where.forEach(condition => {
        users = users.filter(user => {
          const value = (user as any)[condition.field]
          switch (condition.operator) {
            case '==':
              return value === condition.value
            case '!=':
              return value !== condition.value
            case '>':
              return value > (condition.value as any)
            case '>=':
              return value >= (condition.value as any)
            case '<':
              return value < (condition.value as any)
            case '<=':
              return value <= (condition.value as any)
            case 'array-contains':
              return Array.isArray(value) && value.includes(condition.value)
            case 'in':
              return Array.isArray(condition.value) && condition.value.includes(value)
            default:
              return true
          }
        })
      })
    }

    // Apply ordering
    if (options.orderBy) {
      users.sort((a, b) => {
        const aValue = (a as any)[options.orderBy!.field]
        const bValue = (b as any)[options.orderBy!.field]
        const direction = options.orderBy!.direction === 'desc' ? -1 : 1

        if (aValue < bValue) return -1 * direction
        if (aValue > bValue) return 1 * direction
        return 0
      })
    }

    // Apply limit
    if (options.limit) {
      users = users.slice(0, options.limit)
    }

    return users
  }

  async queryPaginated(options: IQueryOptions<User>): Promise<IPaginatedResult<User>> {
    const allUsers = await this.query({ ...options, limit: undefined })
    const limit = options.limit || 10
    const startIndex = options.startAfter ? Number(options.startAfter) : 0
    
    const data = allUsers.slice(startIndex, startIndex + limit)
    const hasMore = startIndex + limit < allUsers.length
    const lastDoc = hasMore ? startIndex + limit : undefined

    return {
      data,
      total: allUsers.length,
      hasMore,
      lastDoc,
    }
  }

  async exists(userId: string): Promise<boolean> {
    const user = await this.findById(userId)
    return user !== null
  }

  // Additional methods for localStorage auth simulation
  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email)
    if (!user) {
      return null
    }

    const storedPassword = localStorage.getItem(`password_${user.id}`)
    const hashedPassword = btoa(password)

    if (storedPassword === hashedPassword) {
      // Update last login
      const updatedUser = await this.update(user.id, {
        metadata: {
          ...user.metadata,
          lastLoginAt: new Date(),
        } as UserMetadata,
      })
      
      this.setCurrentUser(updatedUser)
      return updatedUser
    }

    return null
  }

  signOut(): void {
    this.setCurrentUser(null)
  }

  getCurrentAuthUser(): User | null {
    return this.getCurrentUser()
  }
}