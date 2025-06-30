import { LocalStorageUserRepository } from '@repositories/user/LocalStorageUserRepository'
import { CreateUserDTO } from '@interfaces/models/User'
import { ValidationError, NotFoundError } from '@utils/errors'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock btoa
Object.defineProperty(window, 'btoa', {
  value: (str: string) => Buffer.from(str, 'binary').toString('base64'),
})

describe('LocalStorageUserRepository', () => {
  let repository: LocalStorageUserRepository

  beforeEach(() => {
    repository = new LocalStorageUserRepository()
    localStorage.clear()
  })

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        displayName: 'Test User',
      }

      const user = await repository.create(userData)

      expect(user).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user.displayName).toBe(userData.displayName)
      expect(user.id).toBeDefined()
      expect(user.metadata?.isActive).toBe(true)
      expect(user.metadata?.role).toBe('user')
    })

    it('should throw error for duplicate email', async () => {
      const userData = { email: 'test@example.com' }

      await repository.create(userData)

      await expect(repository.create(userData)).rejects.toThrow(ValidationError)
    })
  })

  describe('findById', () => {
    it('should find user by id', async () => {
      const userData = { email: 'test@example.com' }
      const createdUser = await repository.create(userData)

      const foundUser = await repository.findById(createdUser.id)

      expect(foundUser).toEqual(createdUser)
    })

    it('should return null for non-existent user', async () => {
      const user = await repository.findById('non-existent')

      expect(user).toBeNull()
    })
  })

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const userData = { email: 'test@example.com' }
      const createdUser = await repository.create(userData)

      const foundUser = await repository.findByEmail(userData.email)

      expect(foundUser).toEqual(createdUser)
    })

    it('should return null for non-existent email', async () => {
      const user = await repository.findByEmail('non-existent@example.com')

      expect(user).toBeNull()
    })
  })

  describe('update', () => {
    it('should update user successfully', async () => {
      const userData = { email: 'test@example.com' }
      const createdUser = await repository.create(userData)

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10))

      const updateData = { displayName: 'Updated Name' }
      const updatedUser = await repository.update(createdUser.id, updateData)

      expect(updatedUser.displayName).toBe(updateData.displayName)
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(createdUser.updatedAt.getTime())
    })

    it('should throw error for non-existent user', async () => {
      await expect(repository.update('non-existent', {})).rejects.toThrow(NotFoundError)
    })
  })

  describe('delete', () => {
    it('should delete user successfully', async () => {
      const userData = { email: 'test@example.com' }
      const createdUser = await repository.create(userData)

      await repository.delete(createdUser.id)

      const foundUser = await repository.findById(createdUser.id)
      expect(foundUser).toBeNull()
    })

    it('should throw error for non-existent user', async () => {
      await expect(repository.delete('non-existent')).rejects.toThrow(NotFoundError)
    })
  })

  describe('createWithAuth', () => {
    it('should create user with authentication', async () => {
      const createData: CreateUserDTO = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      }

      const user = await repository.createWithAuth(createData)

      expect(user.email).toBe(createData.email)
      expect(user.displayName).toBe(createData.displayName)
      expect(user.emailVerified).toBe(false)
      expect(user.metadata?.signInProvider).toBe('password')

      // Check password is stored
      const storedPassword = localStorage.getItem(`password_${user.id}`)
      expect(storedPassword).toBeDefined()
    })

    it('should throw error for weak password', async () => {
      const createData: CreateUserDTO = {
        email: 'test@example.com',
        password: '123', // Too short
      }

      await expect(repository.createWithAuth(createData)).rejects.toThrow(ValidationError)
    })
  })

  describe('authenticateUser', () => {
    it('should authenticate user with correct credentials', async () => {
      const createData: CreateUserDTO = {
        email: 'test@example.com',
        password: 'password123',
      }

      const createdUser = await repository.createWithAuth(createData)
      const authenticatedUser = await repository.authenticateUser(
        createData.email,
        createData.password,
      )

      expect(authenticatedUser).toBeDefined()
      expect(authenticatedUser?.id).toBe(createdUser.id)
    })

    it('should return null for incorrect password', async () => {
      const createData: CreateUserDTO = {
        email: 'test@example.com',
        password: 'password123',
      }

      await repository.createWithAuth(createData)
      const authenticatedUser = await repository.authenticateUser(
        createData.email,
        'wrongpassword',
      )

      expect(authenticatedUser).toBeNull()
    })

    it('should return null for non-existent user', async () => {
      const authenticatedUser = await repository.authenticateUser(
        'nonexistent@example.com',
        'password123',
      )

      expect(authenticatedUser).toBeNull()
    })
  })

  describe('query', () => {
    beforeEach(async () => {
      // Create test users
      await repository.create({
        email: 'user1@example.com',
        displayName: 'User One',
        metadata: { role: 'admin', isActive: true },
      })
      await repository.create({
        email: 'user2@example.com',
        displayName: 'User Two',
        metadata: { role: 'user', isActive: true },
      })
      await repository.create({
        email: 'user3@example.com',
        displayName: 'User Three',
        metadata: { role: 'user', isActive: false },
      })
    })

    it('should filter by equality', async () => {
      const users = await repository.query({
        where: [{ field: 'email', operator: '==', value: 'user1@example.com' }],
      })

      expect(users).toHaveLength(1)
      expect(users[0].email).toBe('user1@example.com')
    })

    it('should apply limit', async () => {
      const users = await repository.query({ limit: 2 })

      expect(users).toHaveLength(2)
    })

    it('should order results', async () => {
      const users = await repository.query({
        orderBy: { field: 'email', direction: 'asc' },
      })

      expect(users[0].email).toBe('user1@example.com')
      expect(users[1].email).toBe('user2@example.com')
      expect(users[2].email).toBe('user3@example.com')
    })
  })

  describe('queryPaginated', () => {
    beforeEach(async () => {
      // Create 5 test users
      for (let i = 1; i <= 5; i++) {
        await repository.create({
          email: `user${i}@example.com`,
          displayName: `User ${i}`,
        })
      }
    })

    it('should return paginated results', async () => {
      const result = await repository.queryPaginated({ limit: 2 })

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(5)
      expect(result.hasMore).toBe(true)
      expect(result.lastDoc).toBe(2)
    })

    it('should handle last page', async () => {
      const result = await repository.queryPaginated({
        limit: 3,
        startAfter: 3,
      })

      expect(result.data).toHaveLength(2)
      expect(result.total).toBe(5)
      expect(result.hasMore).toBe(false)
      expect(result.lastDoc).toBeUndefined()
    })
  })

  describe('deactivate and activate', () => {
    it('should deactivate user', async () => {
      const user = await repository.create({ email: 'test@example.com' })

      await repository.deactivate(user.id)

      const updatedUser = await repository.findById(user.id)
      expect(updatedUser?.metadata?.isActive).toBe(false)
    })

    it('should activate user', async () => {
      const user = await repository.create({ email: 'test@example.com' })
      await repository.deactivate(user.id)

      await repository.activate(user.id)

      const updatedUser = await repository.findById(user.id)
      expect(updatedUser?.metadata?.isActive).toBe(true)
    })
  })
})